import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { DocenteService } from '../../../services/docente.service';
import { SiguService } from '../../../services/sigu.service';

type Modalidad = 'PRESENCIAL' | 'SEMIPRESENCIAL' | 'VIRTUAL';
type EstadoAsistencia = 'ASISTIO' | 'TARDANZA';

interface CursoRow {
  codCurso: string;
  nombre: string;
  plan: string;
  sede: string;
  espec: string;
  ciclo: string;
  seccion: string;
  courseid_temp?: any;
}

interface EstudianteRow {
  codigo: string;
  curso: string;
  sec: string;
  esp: string;
  plan: string;
  estudiante: string;
  checked: boolean;
  estado?: EstadoAsistencia | null;
}

interface HorarioRow {
  c_grpcur: string;
  n_numdia: number;
  c_dnidoc: string;
  docente?: string;
  dia?: string;
  hora_inicio?: string;
  hora_fin?: string;
  c_tipo?: string;
}

interface HorarioView extends HorarioRow {
  diaTexto: string;
}

type AsisHeader = {
  id_asistencia: number;
  c_tema: string;
  c_grpcur: string;
};

@Component({
  selector: 'app-asistencia',
  standalone: false,
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.css',
})
export class AsistenciaComponent {
  modalidades: Modalidad[] = ['PRESENCIAL', 'SEMIPRESENCIAL', 'VIRTUAL'];
  periodos: string[] = ['2026-1'];
  temaBloqueado = false;

  modalidadSel: Modalidad = 'SEMIPRESENCIAL';
  periodoSel: string = '2026-1';

  cursosVisible = false;
  loadingCursos = false;
  cursos: CursoRow[] = [];

  modalOpen = false;
  modalTitle = 'Asistencia Estudiantes';
  cursoSel: CursoRow | null = null;

  fechaSel: string = '';
  indicador = '';

  fechaServidor: string = '';
  docenteNombreCompleto: string = '';

  estudiantes: EstudianteRow[] = [];
  buscarTexto = '';

  checkAll = false;
  indeterminate = false;

  estadosAsistencia: { label: string; value: EstadoAsistencia }[] = [
    { label: 'ASISTIÓ', value: 'ASISTIO' },
    { label: 'TARDANZA', value: 'TARDANZA' },
  ];

  detalleDbMap = new Map<number, Set<number>>();

  fechasLoading = false;
  fechasMap = new Map<string, AsisHeader[]>();
  fechaTieneRegistro = false;

  courseidActivo: number | null = null;

  docenteDni: string = '';

  horariosDocente: HorarioRow[] = [];
  horariosVisible: HorarioView[] = [];

  seccionesHabilitadasHoy = new Set<string>();
  seccionesHabilitadasHoyTexto = '';

  constructor(
    private alert: AlertService,
    private docenteService: DocenteService,
    private siguService: SiguService,
  ) {}

  private getCodMod(): number {
    switch (this.modalidadSel) {
      case 'PRESENCIAL':
        return 1;
      case 'SEMIPRESENCIAL':
        return 2;
      case 'VIRTUAL':
        return 3;
      default:
        return 2;
    }
  }

  private periodoToCodper(periodo: string): number {
    const clean = (periodo || '').replace('-', '').trim();
    const n = Number(clean);
    return Number.isFinite(n) ? n : 0;
  }

  private parseCourseIdTemp(value: any): number | null {
    const s = String(value ?? '').trim();
    if (!/^\d+$/.test(s)) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  private parseInteger(value: any): number | null {
    const s = String(value ?? '').trim();
    if (!/^\d+$/.test(s)) return null;
    const n = Number(s);
    return Number.isInteger(n) ? n : null;
  }

  private isoToYYYYMMDD(iso: any): string {
    const s = String(iso ?? '');
    return s ? s.slice(0, 10) : '';
  }

  private hoyLocalYYYYMMDD(): string {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mm}-${dd}`;
  }

  private nowHHmmss(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private toDbEstado(s: EstadoAsistencia): 'A' | 'T' {
    return s === 'TARDANZA' ? 'T' : 'A';
  }

  private yyyymmddToNumDia(fecha: string): number {
    if (!fecha) return 0;
    const d = new Date(`${fecha}T00:00:00`);
    const js = d.getDay();
    return js === 0 ? 7 : js;
  }

  private numDiaToTexto(n: number): string {
    switch (n) {
      case 1:
        return 'Lunes';
      case 2:
        return 'Martes';
      case 3:
        return 'Miércoles';
      case 4:
        return 'Jueves';
      case 5:
        return 'Viernes';
      case 6:
        return 'Sábado';
      case 7:
        return 'Domingo';
      default:
        return '-';
    }
  }

  private extractDni(res: any): string {
    const dni = String(res?.body?.dni ?? res?.dni ?? '').trim();
    return /^\d{8}$/.test(dni) ? dni : '';
  }

  private setDocenteInfo(res: any) {
    const data = res?.body ?? res;

    const dni = String(data?.dni ?? '').trim();
    if (/^\d{8}$/.test(dni)) this.docenteDni = dni;

    const n = String(data?.docente?.nombres ?? '').trim();
    const ap = String(data?.docente?.apepat ?? '').trim();
    const am = String(data?.docente?.apemat ?? '').trim();

    this.docenteNombreCompleto = `${n} ${ap} ${am}`.replace(/\s+/g, ' ').trim();
  }

  private ensureFechaHoy() {
    if (this.fechaSel) return;
    this.fechaSel = this.fechaServidor || this.hoyLocalYYYYMMDD();
  }

  private resetModalState() {
    this.indicador = '';
    this.buscarTexto = '';

    this.estudiantes = [];
    this.refreshCheckState();

    this.fechasMap.clear();
    this.fechaTieneRegistro = false;

    this.horariosDocente = [];
    this.horariosVisible = [];

    this.seccionesHabilitadasHoy.clear();
    this.seccionesHabilitadasHoyTexto = '';
    this.temaBloqueado = false;
  }

  verCursos() {
    this.cursosVisible = true;
    this.loadingCursos = true;
    this.cursos = [];

    const n_codper = this.periodoToCodper(this.periodoSel);
    const c_codmod = this.getCodMod();

    if (!n_codper) {
      this.loadingCursos = false;
      this.alert.warning('Periodo inválido', 'Revisa el periodo seleccionado');
      return;
    }

    this.docenteService.verificarDocente().subscribe({
      next: (res: any) => {
        const dni = this.extractDni(res);

        if (!dni) {
          this.loadingCursos = false;
          this.alert.warning('No eres docente', 'Acceso restringido');
          return;
        }

        this.setDocenteInfo(res);

        this.docenteService
          .getCursosDocentes(dni, n_codper, c_codmod)
          .subscribe({
            next: (data: any) => {
              this.loadingCursos = false;

              const list = Array.isArray(data) ? data : [];

              console.log(
                '[CURSOS] planes raw =>',
                list.map((x: any) => ({
                  c_codcur: x?.c_codcur,
                  n_codpla: x?.n_codpla,
                  typeof_n_codpla: typeof x?.n_codpla,
                  json_n_codpla: JSON.stringify(x?.n_codpla),
                })),
              );

              this.cursos = list.map((x: any) => ({
                codCurso: String(x?.c_codcur ?? ''),
                nombre: String(x?.c_nomcur ?? ''),
                plan: String(x?.n_codpla ?? ''),
                sede: String(x?.c_sedcod ?? '-') || '-',
                espec: String(x?.c_codesp ?? ''),
                ciclo: String(x?.n_ciclo ?? ''),
                seccion: String(x?.secciones ?? ''),
                courseid_temp: x?.courseid_temp,
              }));

              console.log(
                '[CURSOS] planes mapeados =>',
                this.cursos.map((c) => ({
                  codCurso: c.codCurso,
                  plan: c.plan,
                  typeof_plan: typeof c.plan,
                  json_plan: JSON.stringify(c.plan),
                })),
              );

              if (!this.cursos.length) {
                this.alert.warning(
                  'No se encontraron cursos para el periodo/modalidad.',
                  'Sin resultados',
                );
              }
            },
            error: () => {
              this.loadingCursos = false;
              this.alert.warning(
                'Error consultando cursos',
                'Intenta nuevamente',
              );
            },
          });
      },
      error: () => {
        this.loadingCursos = false;
        this.alert.warning('Error verificando docente', 'Intenta nuevamente');
      },
    });
  }

  abrirModalAsistencia(curso: CursoRow) {
    console.log('[OPEN MODAL] curso recibido =>', curso);
    console.log('[OPEN MODAL] curso.plan =>', curso?.plan);
    console.log('[OPEN MODAL] typeof curso.plan =>', typeof curso?.plan);
    console.log('[OPEN MODAL] plan trim =>', String(curso?.plan ?? '').trim());
    console.log('[OPEN MODAL] Number(plan) =>', Number(curso?.plan));
    console.log(
      '[OPEN MODAL] Number.isInteger(Number(plan)) =>',
      Number.isInteger(Number(curso?.plan)),
    );
    console.log('[OPEN MODAL] JSON plan =>', JSON.stringify(curso?.plan));

    this.cursoSel = curso;
    this.modalOpen = true;

    this.resetModalState();

    const courseid = this.parseCourseIdTemp(curso?.courseid_temp);
    if (!courseid) {
      this.alert.warning(
        'Sin courseid válido',
        'No se puede listar matriculados/asistencias',
      );
      return;
    }
    this.courseidActivo = courseid;

    this.fechaServidor = this.hoyLocalYYYYMMDD();

    if (this.docenteDni) {
      this.ensureFechaHoy();
      this.cargarHorarios(courseid);
      this.cargarMatriculados(courseid);
      this.cargarFechasRegistradas(courseid);
      return;
    }

    this.docenteService.verificarDocente().subscribe({
      next: (res: any) => {
        const dni = this.extractDni(res);

        if (!dni) {
          this.alert.warning('No eres docente', 'Acceso restringido');
          this.cerrarModal();
          return;
        }

        this.setDocenteInfo(res);

        this.ensureFechaHoy();
        this.cargarHorarios(courseid);
        this.cargarMatriculados(courseid);
        this.cargarFechasRegistradas(courseid);
      },
      error: () => {
        this.alert.warning('Error verificando docente', 'Intenta nuevamente');
        this.cerrarModal();
      },
    });
  }

  onFechaChange() {
    this.calcularSeccionesHabilitadasHoy();
    this.aplicarBloqueoPorDia();
    this.aplicarFechaSeleccionada();
  }

  private aplicarFechaSeleccionada() {
    const headers = this.fechasMap.get(this.fechaSel) || [];
    this.fechaTieneRegistro = headers.length > 0;

    this.indicador = '';
    this.temaBloqueado = false;

    const seccionesHoy = Array.from(this.seccionesHabilitadasHoy || [])
      .map((x) => String(x).trim())
      .filter(Boolean);

    console.log('[FECHA] fechaSel=', this.fechaSel);
    console.log('[FECHA] headersHoy=', headers);
    console.log('[FECHA] seccionesHoy(habilitadas)=', seccionesHoy);

    if (!seccionesHoy.length) {
      console.log(
        '[FECHA] No hay secciones habilitadas en la fecha seleccionada',
      );

      const ids = headers.map((h) => h.id_asistencia);
      if (ids.length > 0) {
        this.cargarDetalleAsistencias(ids);
      } else {
        for (const e of this.estudiantes as any[]) {
          (e as any)._visible = (e as any)._visible !== false;
          e.checked = false;
          e.estado = null;
        }
        this.refreshCheckState();
      }
      return;
    }

    if (seccionesHoy.length === 1) {
      const sec = seccionesHoy[0];
      const headerDeEsaSeccion = headers.find(
        (h) => String(h.c_grpcur).trim() === sec,
      );

      console.log('[FECHA] Sección única =>', sec);
      console.log('[FECHA] Header encontrado =>', headerDeEsaSeccion);

      if (headerDeEsaSeccion?.c_tema?.trim()) {
        this.indicador = String(headerDeEsaSeccion.c_tema).trim();
        this.temaBloqueado = true;
        console.log('[FECHA] indicador seteado y bloqueado =>', this.indicador);
      }

      const ids = headers.map((h) => h.id_asistencia);
      if (ids.length > 0) {
        this.cargarDetalleAsistencias(ids);
      } else {
        for (const e of this.estudiantes as any[]) {
          (e as any)._visible = (e as any)._visible !== false;
          e.checked = false;
          e.estado = null;
        }
        this.refreshCheckState();
      }
      return;
    }

    const headersDeMisSecciones = headers.filter((h) =>
      seccionesHoy.includes(String(h.c_grpcur).trim()),
    );

    console.log('[FECHA] headersDeMisSecciones =>', headersDeMisSecciones);

    const temas = Array.from(
      new Set(
        headersDeMisSecciones
          .map((h) => String(h.c_tema ?? '').trim())
          .filter(Boolean),
      ),
    );

    console.log('[FECHA] temas únicos detectados =>', temas);

    if (temas.length === 1) {
      this.indicador = temas[0];
      this.temaBloqueado = true;
      console.log(
        '[FECHA] indicador seteado y bloqueado (tema único) =>',
        this.indicador,
      );
    } else if (temas.length > 1) {
      this.indicador = '';
      this.temaBloqueado = false;
      console.log('[FECHA] temas distintos por sección => indicador libre');
    } else {
      this.indicador = '';
      this.temaBloqueado = false;
      console.log('[FECHA] no hay tema registrado => indicador libre');
    }

    const ids = headers.map((h) => h.id_asistencia);
    if (ids.length > 0) {
      this.cargarDetalleAsistencias(ids);
    } else {
      for (const e of this.estudiantes as any[]) {
        (e as any)._visible = (e as any)._visible !== false;
        e.checked = false;
        e.estado = null;
      }
      this.refreshCheckState();
    }
  }

  private cargarMatriculados(courseid: number) {
    this.docenteService.matriculados(courseid).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : [];

        console.log('[MAT] alumno raw ejemplo =>', list[0]);

        console.log(
          '[MAT] RAW (10 primeros):',
          list.slice(0, 10).map((m: any) => ({
            c_codalu: m?.c_codalu,
            CodigoCurso: m?.CodigoCurso,
            SeccionCurso: m?.SeccionCurso,
            Especialidad: m?.Especialidad,
            PlanCurso: m?.PlanCurso,
          })),
        );

        this.estudiantes = list.map((m: any) => {
          const cursoRaw = String(
            m?.CodigoCurso ?? this.cursoSel?.codCurso ?? '',
          ).trim();

          const secRaw = String(m?.SeccionCurso ?? '').trim();

          const espRaw = String(m?.Especialidad ?? '').trim();

          const planRaw = String(
            m?.PlanCurso ??
              m?.n_codpla ??
              m?.plan ??
              m?.Plan ??
              m?.CodPlan ??
              '',
          ).trim();

          return {
            codigo: String(m?.c_codalu ?? '').trim(),
            curso: cursoRaw,
            sec: secRaw,
            esp: espRaw,
            plan: planRaw,
            estudiante:
              `${m?.paterno ?? ''} ${m?.materno ?? ''}, ${m?.nombres ?? ''}`
                .replace(/\s+/g, ' ')
                .trim(),
            checked: false,
            estado: null,
          };
        });

        console.log(
          '[MAT] MAPEADOS (10 primeros):',
          this.estudiantes.slice(0, 10).map((e) => ({
            codigo: e.codigo,
            curso: e.curso,
            sec: e.sec,
            esp: e.esp,
            plan: e.plan,
          })),
        );

        const resumen: Record<string, number> = {};
        for (const e of this.estudiantes) {
          const k = String(e.sec ?? '').trim() || '(VACIO)';
          resumen[k] = (resumen[k] ?? 0) + 1;
        }
        console.log('[MAT] RESUMEN secciones:', resumen);

        console.log(
          '[MAT] RESUMEN curso-sec-esp-plan:',
          this.estudiantes.slice(0, 20).map((e) => ({
            codigo: e.codigo,
            curso: e.curso,
            sec: e.sec,
            esp: e.esp,
            plan: e.plan,
          })),
        );

        for (const e of this.estudiantes as any[]) e._visible = true;

        this.aplicarBloqueoPorDia();
        this.refreshCheckState();
      },
      error: () =>
        this.alert.warning('No se pudo cargar matriculados', 'Error'),
    });
  }

  private cargarHorarios(courseid: number) {
    this.docenteService.getHorarios(courseid).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : [];
        const dni = (this.docenteDni || '').trim();

        console.log('[HOR] RAW count=', list.length);
        console.log('[HOR] docenteDni=', dni);
        console.log('[HOR] fechaSel (antes ensure)=', this.fechaSel);

        const rows = list
          .map((x: any) => ({
            c_grpcur: String(x?.c_grpcur ?? '').trim(),
            n_numdia: Number(x?.n_numdia),
            c_dnidoc: String(x?.c_dnidoc ?? '').trim(),
            docente: String(x?.docente ?? '').trim(),
            dia: String(x?.dia ?? '').trim(),
            hora_inicio: String(x?.hora_inicio ?? '').trim(),
            hora_fin: String(x?.hora_fin ?? '').trim(),
            c_tipo: String(x?.c_tipo ?? '').trim(),
          }))
          .filter((h: HorarioRow) => h.c_grpcur && Number.isFinite(h.n_numdia))
          .filter((h: HorarioRow) => h.c_dnidoc === dni);

        console.log('[HOR] rows (filtrados por dni) count=', rows.length);

        console.log(
          '[HOR] rows sample(10)=',
          rows.slice(0, 10).map((r) => ({
            c_grpcur: r.c_grpcur,
            n_numdia: r.n_numdia,
            hora_inicio: r.hora_inicio,
            hora_fin: r.hora_fin,
            c_tipo: r.c_tipo,
          })),
        );

        if (!rows.length) {
          this.alert.warning(
            'No tienes horario asignado para este curso',
            'No puedes registrar asistencia',
          );
          this.cerrarModal();
          return;
        }

        const uniqMap = new Map<string, HorarioRow>();
        for (const h of rows) {
          const key = `${h.c_grpcur}|${h.n_numdia}|${h.hora_inicio}|${h.hora_fin}|${h.c_tipo}|${h.c_dnidoc}|${h.docente}`;
          if (!uniqMap.has(key)) uniqMap.set(key, h);
        }
        this.horariosDocente = Array.from(uniqMap.values());

        const group = new Map<
          string,
          { base: HorarioRow; secciones: Set<string> }
        >();
        for (const h of this.horariosDocente) {
          const key = `${h.n_numdia}|${h.hora_inicio}|${h.hora_fin}|${h.c_tipo}|${h.c_dnidoc}|${h.docente}`;
          if (!group.has(key))
            group.set(key, { base: h, secciones: new Set<string>() });
          group.get(key)!.secciones.add(String(h.c_grpcur).trim());
        }

        this.horariosVisible = Array.from(group.values())
          .map(({ base, secciones }) => ({
            ...base,
            c_grpcur: Array.from(secciones).sort().join(', '),
            diaTexto: this.numDiaToTexto(base.n_numdia),
          }))
          .sort((a, b) => {
            const byDay = a.n_numdia - b.n_numdia;
            if (byDay !== 0) return byDay;
            const byTime = String(a.hora_inicio).localeCompare(
              String(b.hora_inicio),
            );
            if (byTime !== 0) return byTime;
            return String(a.c_grpcur).localeCompare(String(b.c_grpcur));
          });

        this.ensureFechaHoy();
        this.calcularSeccionesHabilitadasHoy();

        console.log(
          '[HOR] seccionesHabilitadasHoy =>',
          Array.from(this.seccionesHabilitadasHoy || []),
        );

        this.aplicarBloqueoPorDia();
        this.aplicarFechaSeleccionada();
      },
      error: () => this.alert.warning('No se pudo cargar horarios', 'Error'),
    });
  }

  private calcularSeccionesHabilitadasHoy() {
    this.seccionesHabilitadasHoy.clear();

    const diaSel = this.yyyymmddToNumDia(this.fechaSel);
    const deEseDia = this.horariosDocente.filter((h) => h.n_numdia === diaSel);

    for (const h of deEseDia) {
      this.seccionesHabilitadasHoy.add(String(h.c_grpcur).trim());
    }

    const arr = Array.from(this.seccionesHabilitadasHoy).sort();
    this.seccionesHabilitadasHoyTexto = arr.join(', ');
  }

  private aplicarBloqueoPorDia() {
    if (
      !this.seccionesHabilitadasHoy ||
      this.seccionesHabilitadasHoy.size === 0
    ) {
      for (const e of this.estudiantes as any[]) {
        e._visible = false;
        e.checked = false;
        e.estado = null;
      }
      this.refreshCheckState();
      return;
    }

    for (const e of this.estudiantes as any[]) {
      const sec = String(e.sec || '').trim();
      const habil = this.seccionesHabilitadasHoy.has(sec);

      e._visible = habil;

      if (!habil) {
        e.checked = false;
        e.estado = null;
      }
    }

    this.refreshCheckState();
  }

  private cargarFechasRegistradas(courseid: number) {
    this.fechasLoading = true;
    this.fechasMap.clear();

    this.docenteService.getFechasAsistencia(courseid).subscribe({
      next: (data: any) => {
        this.fechasLoading = false;

        const list = Array.isArray(data) ? data : [];

        for (const x of list) {
          const date = this.isoToYYYYMMDD(x?.d_fecha);
          const id = Number(x?.id_asistencia);
          const tema = String(x?.c_tema ?? '').trim();
          const grp = String(x?.c_grpcur ?? '').trim();

          if (!date || !Number.isFinite(id)) continue;

          if (!this.fechasMap.has(date)) this.fechasMap.set(date, []);
          this.fechasMap.get(date)!.push({
            id_asistencia: id,
            c_tema: tema,
            c_grpcur: grp,
          });
        }

        this.aplicarFechaSeleccionada();
      },
      error: () => {
        this.fechasLoading = false;
        this.alert.warning('No se pudo cargar fechas registradas', 'Error');
      },
    });
  }

  private cargarDetalleAsistencias(ids_asistencias: number[]) {
    this.docenteService.getDetalleAsistencias(ids_asistencias).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : [];

        this.detalleDbMap.clear();

        const mapEstado = new Map<string, EstadoAsistencia>();

        for (const x of list) {
          const id = Number(x?.id_asistencia);
          const codStr = String(x?.c_codalu ?? '').trim();
          const cod = Number(codStr);
          const est = String(x?.c_estado ?? '')
            .trim()
            .toUpperCase();

          if (Number.isFinite(id) && Number.isFinite(cod)) {
            if (!this.detalleDbMap.has(id))
              this.detalleDbMap.set(id, new Set());
            this.detalleDbMap.get(id)!.add(cod);
          }

          if (!codStr) continue;
          if (est === 'T') mapEstado.set(codStr, 'TARDANZA');
          else if (est === 'A') mapEstado.set(codStr, 'ASISTIO');
        }

        for (const e of this.estudiantes as any[]) {
          if (e._visible === false) {
            e.checked = false;
            e.estado = null;
            continue;
          }

          const st = mapEstado.get(String(e.codigo));
          if (st) {
            e.checked = true;
            e.estado = st;
          } else {
            e.checked = false;
            e.estado = null;
          }
        }

        this.refreshCheckState();
      },
      error: () =>
        this.alert.warning('No se pudo cargar detalle de asistencia', 'Error'),
    });
  }

  cerrarModal() {
    this.modalOpen = false;
    this.cursoSel = null;
    this.courseidActivo = null;
    this.indicador = '';
    this.temaBloqueado = false;
  }

  onOverlayClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) this.cerrarModal();
  }

  get estudiantesFiltrados(): EstudianteRow[] {
    const q = (this.buscarTexto || '').trim().toLowerCase();

    const base = this.estudiantes.filter((e: any) => e._visible !== false);

    if (!q) return base;

    return base.filter((e) => {
      return (
        (e.codigo || '').toLowerCase().includes(q) ||
        (e.estudiante || '').toLowerCase().includes(q) ||
        (e.sec || '').toLowerCase().includes(q) ||
        (e.plan || '').toLowerCase().includes(q) ||
        (e.curso || '').toLowerCase().includes(q)
      );
    });
  }

  toggleRowByClick(row: EstudianteRow, ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    const ignore = target.closest(
      'select, input[type="checkbox"], button, a, input, textarea',
    );
    if (ignore) return;

    this.toggleRow(row, !row.checked);
  }

  toggleRow(row: EstudianteRow, checked: boolean) {
    row.checked = checked;
    if (checked) row.estado = row.estado ?? 'ASISTIO';
    else row.estado = null;

    this.refreshCheckState();
  }

  toggleAll(checked: boolean) {
    this.checkAll = checked;
    this.indeterminate = false;

    for (const e of this.estudiantesFiltrados) {
      e.checked = checked;
      if (checked) e.estado = e.estado ?? 'ASISTIO';
      else e.estado = null;
    }

    this.refreshCheckState();
  }

  refreshCheckState() {
    const list = this.estudiantesFiltrados;
    const checkedCount = list.filter((x) => x.checked).length;

    this.checkAll = list.length > 0 && checkedCount === list.length;
    this.indeterminate = checkedCount > 0 && checkedCount < list.length;
  }

  async guardarAsistencia() {
    const errores: string[] = [];

    if (!this.indicador.trim()) {
      errores.push('• Indicador de Logro / Tema es obligatorio.');
    }
    if (!this.fechaSel) {
      errores.push('• Fecha es obligatoria.');
    }

    if (this.fechaServidor && this.fechaSel > this.fechaServidor) {
      errores.push(
        `• No puedes registrar asistencia en una fecha futura. Fecha servidor: ${this.fechaServidor}.`,
      );
    }

    if (
      !this.seccionesHabilitadasHoy ||
      this.seccionesHabilitadasHoy.size === 0
    ) {
      errores.push(
        '• No tienes horario para este curso en la fecha seleccionada.',
      );
    }

    const visibles = this.estudiantesFiltrados;
    const marcados = visibles.filter((e) => e.checked);

    if (marcados.length === 0) {
      errores.push('• Selecciona al menos un estudiante habilitado.');
    }

    const sinEstado = marcados.filter((e) => !e.estado);
    if (sinEstado.length > 0) {
      errores.push(
        `• Hay ${sinEstado.length} estudiante(s) seleccionado(s) sin estado (ASISTIÓ/TARDANZA).`,
      );
    }

    const n_codper = this.periodoToCodper(this.periodoSel);
    const c_codmod = this.getCodMod();

    if (!n_codper) errores.push('• Periodo inválido.');
    if (!this.docenteDni) errores.push('• DNI docente no encontrado.');

    console.log(
      '[SAVE] VISIBLES =>',
      visibles.map((e) => ({
        codigo: e.codigo,
        curso: e.curso,
        sec: e.sec,
        esp: e.esp,
        plan: e.plan,
        checked: e.checked,
        estado: e.estado,
      })),
    );

    console.log(
      '[SAVE] MARCADOS =>',
      marcados.map((e) => ({
        codigo: e.codigo,
        curso: e.curso,
        sec: e.sec,
        esp: e.esp,
        plan: e.plan,
        estado: e.estado,
      })),
    );

    // ✅ agrupar por TODOS los visibles, no solo los marcados
    const grupos = new Map<string, EstudianteRow[]>();

    for (const e of visibles) {
      const curso = String(e.curso || '').trim();
      const sec = String(e.sec || '').trim();
      const esp = String(e.esp || '').trim();
      const plan = String(e.plan || '').trim();

      if (!curso || !sec || !esp || !plan) {
        console.warn('[SAVE] alumno descartado por datos incompletos =>', {
          codigo: e.codigo,
          curso,
          sec,
          esp,
          plan,
          original: e,
        });
        continue;
      }

      const key = `${curso}|${sec}|${esp}|${plan}`;

      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(e);
    }

    if (grupos.size === 0) {
      errores.push(
        '• No se pudo determinar curso/sección/especialidad/plan de los alumnos habilitados.',
      );
    }

    console.log('[SAVE] GRUPOS detectados:', Array.from(grupos.keys()));

    for (const key of grupos.keys()) {
      const [, sec] = key.split('|');
      if (!this.seccionesHabilitadasHoy.has(sec)) {
        errores.push(
          `• No tienes horario para la sección ${sec} en la fecha seleccionada.`,
        );
      }
    }

    if (errores.length) {
      this.alert.warning(errores.join('\n'), 'No se puede guardar');
      return;
    }

    this.alert.showSavingAsistencia?.();

    try {
      const headersHoy = this.fechasMap.get(this.fechaSel) || [];

      for (const [key, alumnosDelGrupo] of grupos.entries()) {
        const [c_codcur, c_grpcur, c_codesp, n_codplaStr] = key.split('|');
        const n_codpla = this.parseInteger(n_codplaStr);

        if (n_codpla === null) {
          throw new Error(`Plan inválido para el grupo ${key}`);
        }

        // ✅ solo los marcados del grupo
        const alumnosMarcados = alumnosDelGrupo.filter((e) => e.checked);

        console.log('[SAVE] LOOP grupo =>', {
          c_codcur,
          c_grpcur,
          c_codesp,
          n_codpla,
          totalGrupo: alumnosDelGrupo.length,
          marcadosGrupo: alumnosMarcados.length,
        });

        const existente = headersHoy.find(
          (h) => String(h.c_grpcur).trim() === String(c_grpcur).trim(),
        );

        const payloadCabecera = {
          n_codper,
          c_codmod,
          c_codfac: 'S',
          c_codesp: String(c_codesp).trim(),
          c_codcur: String(c_codcur).trim(),
          c_grpcur: String(c_grpcur).trim(),
          c_dnidoc: String(this.docenteDni).trim(),
          d_fecha: this.fechaSel,
          d_fecha_registro: this.fechaSel,
          c_tema: this.indicador.trim(),
          n_codpla: n_codpla,
          c_user_upd: 'FRONT',
          d_fecha_upd: `${this.fechaSel} ${this.nowHHmmss()}`,
        };

        console.log('[SAVE] payloadCabecera =>', payloadCabecera);

        let id_asistencia: number | null = existente?.id_asistencia ?? null;

        // ✅ crear cabecera solo si hay al menos 1 marcado
        if (!id_asistencia && alumnosMarcados.length > 0) {
          const r1 = await firstValueFrom(
            this.siguService.tbAsisAlumCreate(payloadCabecera, { wait: true }),
          );

          id_asistencia = r1?.result?.id_asistencia ?? null;

          if (!id_asistencia || id_asistencia <= 0) {
            throw new Error(`No se obtuvo id_asistencia para grupo ${key}`);
          }
        }

        // ✅ si no existe cabecera y no hay marcados, no hay nada que hacer
        if (!id_asistencia) {
          console.log(
            '[SAVE] grupo sin id_asistencia y sin marcados, no se procesa =>',
            key,
          );
          continue;
        }

        const items = alumnosMarcados.map((e) => ({
          id_asistencia: id_asistencia as number,
          c_codalu: Number(e.codigo),
          c_estado: this.toDbEstado(e.estado as EstadoAsistencia),
          seguir: `${this.fechaSel} ${this.nowHHmmss()}`,
        }));

        console.log('[SAVE] DET items (10):', items.slice(0, 10));

        const existedSet =
          this.detalleDbMap?.get?.(id_asistencia) instanceof Set
            ? (this.detalleDbMap.get(id_asistencia) as Set<number>)
            : new Set<number>();

        const markedSet = new Set<number>(items.map((x) => x.c_codalu));

        const toDelete: number[] = [];
        for (const cod of existedSet) {
          if (!markedSet.has(cod)) toDelete.push(cod);
        }

        console.log('[SAVE] existedSet =>', Array.from(existedSet));
        console.log('[SAVE] markedSet =>', Array.from(markedSet));
        console.log('[SAVE] toDelete =>', toDelete);

        // ✅ borra todos los que antes estaban y ahora ya no están
        for (const c_codalu of toDelete) {
          try {
            await firstValueFrom(
              this.siguService.tbAsisAlumDetDelete(
                { id_asistencia, c_codalu },
                { wait: true },
              ),
            );
          } catch {
            // ignore
          }
        }

        // ✅ si ya no quedó nadie marcado en esa sección, no insertes nada
        if (items.length === 0) {
          console.log(
            '[SAVE] grupo sin marcados, solo se eliminaron detalles =>',
            key,
          );
          continue;
        }

        try {
          await firstValueFrom(
            this.siguService.tbAsisAlumDetCreateMany({ items }, { wait: true }),
          );
        } catch {
          for (const it of items) {
            try {
              await firstValueFrom(
                this.siguService.tbAsisAlumDetDelete(
                  { id_asistencia: it.id_asistencia, c_codalu: it.c_codalu },
                  { wait: true },
                ),
              );
            } catch {
              // ignore
            }
          }

          await firstValueFrom(
            this.siguService.tbAsisAlumDetCreateMany({ items }, { wait: true }),
          );
        }
      }

      this.alert.close();

      this.alert.success(
        'Asistencia guardada',
        `Se registró/actualizó correctamente para ${grupos.size} grupo(s).`,
      );

      if (this.courseidActivo) {
        this.cargarFechasRegistradas(this.courseidActivo);
      }

      this.cerrarModal();
    } catch (err) {
      console.error('guardarAsistencia error =>', err);
      this.alert.close();
      this.alert.warning('Ocurrió un error al guardar', 'Intenta nuevamente');
    } finally {
      this.alert.close();
    }
  }

  onToggleAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement)?.checked ?? false;
    this.toggleAll(checked);
  }

  onToggleRowCheckbox(row: EstudianteRow, ev: Event) {
    const checked = (ev.target as HTMLInputElement)?.checked ?? false;
    this.toggleRow(row, checked);
  }
}

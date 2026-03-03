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
type AsisHeader = { id_asistencia: number; c_tema: string; c_grpcur: string };

@Component({
  selector: 'app-asistencia',
  standalone: false,
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.css',
})
export class AsistenciaComponent {
  modalidades: Modalidad[] = ['PRESENCIAL', 'SEMIPRESENCIAL', 'VIRTUAL'];
  periodos: string[] = ['2026-1'];

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

    const c_grpcur = String(this.cursoSel?.seccion || '')
      .split(',')[0]
      .trim();

    const headerDeMiSeccion = headers.find((h) => h.c_grpcur === c_grpcur);

    if (headerDeMiSeccion?.c_tema) {
      this.indicador = headerDeMiSeccion.c_tema;
    } else {
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
        this.estudiantes = list.map((m: any) => ({
          codigo: String(m?.c_codalu ?? ''),
          curso: String(m?.CodigoCurso ?? this.cursoSel?.codCurso ?? ''),
          sec: String(m?.SeccionCurso ?? ''),
          esp: String(m?.Especialidad ?? ''),
          estudiante:
            `${m?.paterno ?? ''} ${m?.materno ?? ''}, ${m?.nombres ?? ''}`
              .replace(/\s+/g, ' ')
              .trim(),
          checked: false,
          estado: null,
        }));

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

        this.calcularSeccionesHabilitadasHoy();
        this.aplicarBloqueoPorDia();
      },
      error: () => this.alert.warning('No se pudo cargar horarios', 'Error'),
    });
  }

  private calcularSeccionesHabilitadasHoy() {
    this.seccionesHabilitadasHoy.clear();

    const diaSel = this.yyyymmddToNumDia(this.fechaSel);
    const deEseDia = this.horariosDocente.filter((h) => h.n_numdia === diaSel);

    for (const h of deEseDia)
      this.seccionesHabilitadasHoy.add(String(h.c_grpcur).trim());

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
        (e.sec || '').toLowerCase().includes(q)
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

    if (!this.indicador.trim())
      errores.push('• Indicador de Logro / Tema es obligatorio.');
    if (!this.fechaSel) errores.push('• Fecha es obligatoria.');

    if (this.fechaServidor && this.fechaSel !== this.fechaServidor) {
      errores.push(
        `• No puedes registrar asistencia en una fecha distinta a HOY (Servidor: ${this.fechaServidor}).`,
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

    const marcados = this.estudiantesFiltrados.filter((e) => e.checked);
    if (marcados.length === 0)
      errores.push('• Selecciona al menos un estudiante habilitado.');

    const sinEstado = marcados.filter((e) => !e.estado);
    if (sinEstado.length > 0) {
      errores.push(
        `• Hay ${sinEstado.length} estudiante(s) seleccionado(s) sin estado (ASISTIÓ/TARDANZA).`,
      );
    }

    const n_codper = this.periodoToCodper(this.periodoSel);
    const c_codmod = this.getCodMod();

    if (!n_codper) errores.push('• Periodo inválido.');
    if (!this.cursoSel?.codCurso) errores.push('• Curso inválido.');
    if (!this.cursoSel?.seccion) errores.push('• Sección inválida.');
    if (!this.cursoSel?.espec) errores.push('• Especialidad inválida.');
    if (!this.cursoSel?.plan) errores.push('• Plan inválido.');
    if (!this.docenteDni) errores.push('• DNI docente no encontrado.');

    if (errores.length) {
      this.alert.warning(errores.join('\n'), 'No se puede guardar');
      return;
    }

    this.alert.showSavingAsistencia?.();

    const c_grpcur = String(this.cursoSel?.seccion || '')
      .split(',')[0]
      .trim();

    const headersHoy = this.fechasMap.get(this.fechaSel) || [];
    const existente = headersHoy.find(
      (h) => String(h.c_grpcur).trim() === c_grpcur,
    );

    const payloadCabecera = {
      n_codper,
      c_codmod,
      c_codfac: 'S',
      c_codesp: String(this.cursoSel?.espec || '').trim(),
      c_codcur: String(this.cursoSel?.codCurso || '').trim(),
      c_grpcur,
      c_dnidoc: String(this.docenteDni).trim(),
      d_fecha: this.fechaSel,
      d_fecha_registro: this.fechaSel,
      c_tema: this.indicador.trim(),
      n_codpla: Number(this.cursoSel?.plan),
      c_user_upd: 'FRONT',
      d_fecha_upd: `${this.fechaSel} ${this.nowHHmmss()}`,
    };

    try {
      let id_asistencia: number | null = existente?.id_asistencia ?? null;

      if (!id_asistencia) {
        const r1 = await firstValueFrom(
          this.siguService.tbAsisAlumCreate(payloadCabecera, { wait: true }),
        );

        id_asistencia = r1?.result?.id_asistencia ?? null;

        if (!id_asistencia || id_asistencia <= 0) {
          this.alert.warning(
            'No se obtuvo id_asistencia',
            'No se pudo registrar (cabecera)',
          );
          return;
        }
      }

      const items = marcados.map((e) => ({
        id_asistencia: id_asistencia as number,
        c_codalu: Number(e.codigo),
        c_estado: this.toDbEstado(e.estado as any),
        seguir: `${this.fechaSel} ${this.nowHHmmss()}`,
      }));

      const existedSet =
        this.detalleDbMap?.get?.(id_asistencia) instanceof Set
          ? (this.detalleDbMap.get(id_asistencia) as Set<number>)
          : new Set<number>();

      const markedSet = new Set<number>(items.map((x) => x.c_codalu));

      const toDelete: number[] = [];
      for (const cod of existedSet) if (!markedSet.has(cod)) toDelete.push(cod);

      for (const c_codalu of toDelete) {
        try {
          await firstValueFrom(
            this.siguService.tbAsisAlumDetDelete(
              { id_asistencia, c_codalu },
              { wait: true },
            ),
          );
        } catch {}
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
          } catch {}
        }

        await firstValueFrom(
          this.siguService.tbAsisAlumDetCreateMany({ items }, { wait: true }),
        );
      }

      this.alert.close();

      this.alert.success(
        'Asistencia guardada',
        existente
          ? `Actualizada correctamente (ID: ${id_asistencia}).`
          : `Registrada correctamente (ID: ${id_asistencia}).`,
      );

      if (this.courseidActivo) {
        this.cargarFechasRegistradas(this.courseidActivo);
      }
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

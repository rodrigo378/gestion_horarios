import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

// --------------------
// Tipos de respuesta
// --------------------
export type JobResponse<TResult = unknown> = {
  ok: boolean;
  jobId: string | number;
  traceId: string;
  result?: TResult; // 👈 solo viene cuando llamas con wait=1
};

export type TbAsisAlumCreateResult = {
  id_asistencia: number;
};

// --------------------
// Payloads
// --------------------
export type TbAsisAlumCreatePayload = {
  n_codper: number;
  c_codmod: number;
  c_codfac: string;
  c_codesp: string;
  c_codcur: string;
  c_grpcur: string;
  c_dnidoc: string;
  d_fecha: string; // "YYYY-MM-DD"
  d_fecha_registro: string; // "YYYY-MM-DD"
  c_tema: string;
  n_codpla: number;
  c_user_upd: string;
  d_fecha_upd: string; // "YYYY-MM-DD HH:mm:ss"
};

export type TbAsisAlumDeletePayload = {
  id_asistencia: number;
};

export type TbAsisAlumDetItemPayload = {
  id_asistencia: number;
  c_codalu: number;
  c_estado: string;
  seguir: string; // "YYYY-MM-DD HH:mm:ss"
};

// ✅ Aquí lo dejamos en UNA sola forma (recomendada): { items: [...] }
export type TbAsisAlumDetCreateManyPayload = {
  items: TbAsisAlumDetItemPayload[];
};

export type TbAsisAlumDetDeletePayload = {
  id_asistencia: number;
  c_codalu: number;
};

@Injectable({
  providedIn: 'root',
})
export class SiguService {
  private apiUrl = `${environment.api}/core/sigu`;

  constructor(private http: HttpClient) {}

  // -------------------------
  // Vacantes
  // -------------------------
  getVacantes() {
    return this.http.get(`${this.apiUrl}/vacantes/20261`);
  }

  getAulas() {
    return this.http.get(`${this.apiUrl}/aula`);
  }

  gethorarioAula(id_aula: number) {
    return this.http.get(`${this.apiUrl}/aula/${id_aula}`);
  }

  updateAula(
    payload: {
      id_aula: number;
      id_horario: number;
    },
    opts?: { wait?: boolean },
  ) {
    const wait = opts?.wait ? '1' : '0';
    return this.http.patch<JobResponse>(
      `${this.apiUrl}/tb_cur_grp_hor/update?wait=${wait}`,
      payload,
    );
  }

  updateVacante(
    payload: {
      n_codper: number;
      c_codfac: string;
      c_codcur: string;
      c_grpcur: string;
      c_codmod: string;
      c_codesp: string;
      n_codpla: number;
      n_vactot: number;
      n_vacmax: number;
    },
    opts?: { wait?: boolean },
  ) {
    const wait = opts?.wait ? '1' : '0';
    return this.http.patch<JobResponse>(
      `${this.apiUrl}/vacantes?wait=${wait}`,
      payload,
    );
  }

  // -------------------------
  // ✅ tb_asis_alum
  // -------------------------
  tbAsisAlumCreate(
    payload: TbAsisAlumCreatePayload,
    opts?: { wait?: boolean },
  ) {
    const wait = opts?.wait ? '1' : '0';
    return this.http.patch<JobResponse<TbAsisAlumCreateResult>>(
      `${this.apiUrl}/tb_asis_alum/create?wait=${wait}`,
      payload,
    );
  }

  tbAsisAlumDelete(
    payload: TbAsisAlumDeletePayload,
    opts?: { wait?: boolean },
  ) {
    const wait = opts?.wait ? '1' : '0';
    return this.http.patch<JobResponse>(
      `${this.apiUrl}/tb_asis_alum/delete?wait=${wait}`,
      payload,
    );
  }

  // -------------------------
  // ✅ tb_asis_alum_det
  // -------------------------
  tbAsisAlumDetCreateMany(
    payload: TbAsisAlumDetCreateManyPayload,
    opts?: { wait?: boolean },
  ) {
    const wait = opts?.wait ? '1' : '0';
    return this.http.patch<JobResponse>(
      `${this.apiUrl}/tb_asis_alum_det/createMany?wait=${wait}`,
      payload,
    );
  }

  tbAsisAlumDetDelete(
    payload: TbAsisAlumDetDeletePayload,
    opts?: { wait?: boolean },
  ) {
    const wait = opts?.wait ? '1' : '0';
    return this.http.patch<JobResponse>(
      `${this.apiUrl}/tb_asis_alum_det/delete?wait=${wait}`,
      payload,
    );
  }

  // -------------------------
  // ✅ Helper: flujo completo (create -> createMany)
  // -------------------------
  async crearAsistenciaYDetalles(
    cabecera: TbAsisAlumCreatePayload,
    detallesSinId: Omit<TbAsisAlumDetItemPayload, 'id_asistencia'>[],
  ) {
    // 1) crear cabecera esperando result
    const r1 = await this.tbAsisAlumCreate(cabecera, {
      wait: true,
    }).toPromise();

    const id_asistencia = r1?.result?.id_asistencia;
    if (!id_asistencia || id_asistencia <= 0) {
      throw new Error('No se obtuvo id_asistencia en create');
    }

    // 2) crear detalles usando el id
    const items: TbAsisAlumDetItemPayload[] = detallesSinId.map((d) => ({
      ...d,
      id_asistencia,
    }));

    const r2 = await this.tbAsisAlumDetCreateMany(
      { items },
      { wait: true },
    ).toPromise();

    return { id_asistencia, create: r1, createMany: r2 };
  }
}

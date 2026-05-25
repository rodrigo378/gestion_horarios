import { Component, OnInit } from '@angular/core';
import { HR_Curso } from '../../../interfaces/hr/hr_curso';
import { CursoService } from '../../../services/curso.service';

@Component({
  selector: 'app-curso',
  standalone: false,
  templateUrl: './curso.component.html',
  styleUrl: './curso.component.css',
})
export class CursoComponent implements OnInit {
  constructor(private cursoService: CursoService) {}

  cursos!: HR_Curso[];

  listOfColumn = [
    {
      title: 'c_alu',
    },
    {
      title: 'n_codper',
    },
    {
      title: 'c_codmod',
    },
    {
      title: 'c_codfac',
    },
    {
      title: 'c_codesp',
    },
    {
      title: 'c_codcur',
    },
    {
      title: 'c_nomcur',
    },
    {
      title: 'n_ciclo',
    },
  ];

  ngOnInit(): void {
    this.getCursos();
  }

  getCursos() {
    this.cursoService.getCurso().subscribe((data) => {
      console.log('data => ', data);
      this.cursos = data.data;
    });
  }
}

// c_alu;
// n_codper;
// c_codmod;
// c_codfac;
// c_codesp;
// c_codcur;
// c_nomcur;
// n_ciclo;

// {
//     "id": 3,
//     "c_alu": 20,
//     "plan_id": 391,
//     "turno_id": 4,
//     "turno": {
//         "id": 4,
//         "n_codper": 20262,
//         "n_codpla": 2025,
//         "c_codfac": "E",
//         "nom_fac": "FACULTAD DE INGENIERÍA Y NEGOCIOS",
//         "c_codesp": "E2",
//         "nomesp": "ADMINISTRACIÓN Y MARKETING",
//         "c_grpcur": "N1",
//         "c_codmod": 2,
//         "c_nommod": "SEMIPRESENCIAL",
//         "n_ciclo": 4,
//         "subido_sigu": false,
//         "estado_exportacion": "PENDIENTE",
//         "requiere_reexportacion": true,
//         "fecha_ultima_exportacion": null,
//         "solicitud_modificacion": false,
//         "permiso_docente": false,
//         "permiso_aula": false,
//         "permiso_horario": false,
//         "periodo": {
//             "n_codper": 20262,
//             "f_cierre": "2025-11-19T10:31:15.000Z"
//         }
//     },
//     "grupos_padre": [],
//     "grupos_hijo": [
//         {
//             "id": 277,
//             "curso_id": 3,
//             "padre_curso_id": 220,
//             "tipo": 0,
//             "shortname": "SCYF3041-1-2025-N1N1N1",
//             "hijo": {
//                 "id": 3,
//                 "c_alu": 20,
//                 "plan_id": 391,
//                 "turno_id": 4,
//                 "turno": {
//                     "id": 4,
//                     "n_codper": 20262,
//                     "n_codpla": 2025,
//                     "c_codfac": "E",
//                     "nom_fac": "FACULTAD DE INGENIERÍA Y NEGOCIOS",
//                     "c_codesp": "E2",
//                     "nomesp": "ADMINISTRACIÓN Y MARKETING",
//                     "c_grpcur": "N1",
//                     "c_codmod": 2,
//                     "c_nommod": "SEMIPRESENCIAL",
//                     "n_ciclo": 4,
//                     "subido_sigu": false,
//                     "estado_exportacion": "PENDIENTE",
//                     "requiere_reexportacion": true,
//                     "fecha_ultima_exportacion": null,
//                     "solicitud_modificacion": false,
//                     "permiso_docente": false,
//                     "permiso_aula": false,
//                     "permiso_horario": false
//                 }
//             }
//         }
//     ],
//     "plan": {
//         "id": 391,
//         "n_codper": 2025,
//         "c_codmod": 2,
//         "c_codfac": "E",
//         "c_codesp": "E2",
//         "c_codcur": "SAYM3041",
//         "c_nomcur": "FUNDAMENTOS DE GESTIÓN TRIBUTARIA",
//         "n_ciclo": 4,
//         "n_ht": 4,
//         "n_hp": 0,
//         "c_area": "",
//         "c_curup": 2
//     },
//     "vencio": true
// }

import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ChartComponent,
  ApexPlotOptions
} from 'ngx-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

export type ChartOptionsDonut = {
  series: number[];
  chart: ApexChart;
  labels: string[];
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  colors?: string[];
  responsive?: any[];
};

@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})

export class WelcomeComponent {
  @ViewChild("chart") chart!: ChartComponent;

  totalCursos: number = 0;
  totalDocentes: number = 0;
  aulasUtilizadas: number = 0;
  porcentajeAsignacion: number = 0;

  // 👇 Objetos para los gráficos
  public chartDocentes!: ChartOptions;
  public chartAulas!: ChartOptions;
  public chartFacultades!: ChartOptionsDonut;
  public chartAsignaciones!: ChartOptions;
  public chartTurnos!: ChartOptionsDonut;

  constructor() {
    // Gráfico de Horas por Docente
    this.chartDocentes = {
      series: [
        {
          name: "Horas Asignadas",
          data: [20, 35, 40, 10, 30],
        }
      ],
      chart: {
        type: "bar",
        height: 350
      },
      title: {
        text: ""
      },
      xaxis: {
        categories: ["Docente A", "Docente B", "Docente C", "Docente D", "Docente E"]
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      }
    };

    // Gráfico de Uso de Aulas
    this.chartAulas = {
      series: [
        {
          name: "Veces usada",
          data: [12, 8, 15, 6, 10],
        }
      ],
      chart: {
        type: "bar",
        height: 350
      },
      title: {
        text: ""
      },
      xaxis: {
        categories: ["Aula 101", "Aula 102", "Lab 201", "Aula 103", "Auditorio"]
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"]
      }
    };

    this.chartFacultades = {
      series: [60, 40],
      chart: {
        type: "donut",
        height: 350,
        animations: {
          enabled: true
        },
        toolbar: {
          show: false
        }
      },
      labels: ["Ciencias de la Salud", "Ingeniería y Negocios"],
      title: {
        text: "Distribución de Cursos por Facultad"
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '50%', // 👈 más chico = más grosor en el aro
            // labels: {
            //   show: true,
            //   total: {
            //     show: true,
            //     label: 'Total',
            //     formatter: () => '100'
            //   }
            // }
          }
        }
      },
    };

    this.chartAsignaciones = {
      series: [
        {
          name: "Asignaciones",
          data: [5, 10, 15, 7, 12, 20, 25] // ← Asignaciones por día (simulado)
        }
      ],
      chart: {
        type: "line",
        height: 350,
        zoom: {
          enabled: false
        }
      },
      title: {
        text: ""
      },
      xaxis: {
        categories: ["01 Abr", "02 Abr", "03 Abr", "04 Abr", "05 Abr", "06 Abr", "07 Abr"]
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: "smooth",
        width: 3
      }
    };
    
    this.chartTurnos = {
      series: [80, 30, 10],
      chart: {
        type: "donut",
        height: 350,
        animations: { enabled: true },
        toolbar: { show: false }
      },
      labels: ["Asignado", "Pendiente", "No asignado"],
      colors: ['#22c55e', '#eab308', '#94a3b8'],
      title: {
        text: ""
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => '120'
              }
            }
          }
        }
      },
      responsive: []
    };

    this.totalCursos = 120;
    this.totalDocentes = 45;
    this.aulasUtilizadas = 20;
    this.porcentajeAsignacion = Math.round((100 * 110) / 120); // 110 asignados de 120 cursos

  }
  
}

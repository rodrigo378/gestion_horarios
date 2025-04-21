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
  plotOptions?: ApexPlotOptions;
  colors?: string[];
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
  public chartTiposCurso!: ChartOptions;

  constructor() {
    // Gráfico de Horas por Docente
    this.chartDocentes = {
      series: [
        {
          name: "Horas Asignadas",
          data: [20, 35, 40, 10, 30]
        }
      ],
      chart: {
        type: "bar",
        height: 350
      },
      title: {
        text: "Horas por Docente"
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
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: 'end',
          columnWidth: '60%'
        }
      },
      colors: ['#3b82f6']
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
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        }         
      },
      labels: ["Ciencias de la Salud", "Ingeniería y Negocios"],
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
    
    this.chartTurnos = {
      series: [80, 30, 10],
      chart: {
        type: "donut",
        height: 350,
        animations: { enabled: true },
        toolbar: { show: true }
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

    this.chartTiposCurso = {
      series: [
        {
          name: "Cantidad",
          data: [48, 32, 15, 10]
        }
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true, // ✅ NECESARIO para que funcione 'colors'
          borderRadius: 10,
          borderRadiusApplication: 'end',
          columnWidth: '60%'
        }
      },
      title: {
        text: ""
      },
      xaxis: {
        categories: ["Teóricos", "Prácticos", "Transversales", "Agrupados"]
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"]
      },
      colors: ['#3b82f6', '#22c55e', '#facc15', '#a855f7'] // Azul, Verde, Amarillo, Morado
    };

    this.totalCursos = 120;
    this.totalDocentes = 45;
    this.aulasUtilizadas = 20;
    this.porcentajeAsignacion = Math.round((100 * 90) / 120); // 110 asignados de 120 cursos

  }
  
}

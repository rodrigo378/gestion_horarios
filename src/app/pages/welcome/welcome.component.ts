import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ChartComponent,
  ApexPlotOptions,
} from 'ngx-apexcharts';
import { DashboardService } from '../../services/dashboard.service';

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
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  n_codper: string = '20252';

  cargandoCursos: boolean = true;
  mostrarCalendario: boolean = false;

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

  constructor(private dashboardService: DashboardService) {
    // Gráfico de Uso de Aulas
    this.chartAulas = {
      series: [
        {
          name: 'Veces usada',
          data: [12, 8, 15, 6, 10],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      title: {
        text: '',
      },
      xaxis: {
        categories: [
          'Aula 101',
          'Aula 102',
          'Lab 201',
          'Aula 103',
          'Auditorio',
        ],
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['transparent'],
      },
    };

    this.chartFacultades = {
      series: [60, 40],
      chart: {
        type: 'donut',
        height: 350,
        animations: {
          enabled: true,
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
            reset: false,
          },
        },
      },
      labels: ['Ciencias de la Salud', 'Ingeniería y Negocios'],
      title: {
        text: '',
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        show: false,
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
          },
        },
      },
    };
  }

  ngOnInit(): void {
    this.cargarChartDocentes();
    this.loadDashboardData();
    this.cargarTipoCursos();
    this.cargarEstadoTurno();
  }

  cargarChartDocentes(): void {
    this.dashboardService.getHorasPorDocente(this.n_codper).subscribe((res) => {
      this.chartDocentes = {
        series: [
          {
            name: 'Horas Asignadas',
            data: res.data,
          },
        ],
        chart: {
          type: 'bar',
          height: 350,
        },
        title: {
          text: 'Top 10 con mas horas',
        },
        xaxis: {
          categories: res.docente,
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            borderRadiusApplication: 'end',
            columnWidth: '60%',
          },
        },
        colors: ['#3b82f6'],
      };
    });
  }

  loadDashboardData(): void {
    this.dashboardService.getdashboard1(this.n_codper).subscribe({
      next: (data) => {
        this.totalCursos = data.countCursos;
        this.totalDocentes = data.countDocentes;
        this.aulasUtilizadas = data.countAulasAsignadas;
        this.porcentajeAsignacion =
          data.porAsignacion != null
            ? parseFloat(data.porAsignacion.toFixed(2))
            : 0;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.totalCursos = 0;
        this.totalDocentes = 0;
        this.aulasUtilizadas = 0;
        this.porcentajeAsignacion = 0;
      },
    });
  }

  cargarTipoCursos(): void {
    this.dashboardService.cargarTipoCursos(this.n_codper).subscribe((res) => {
      this.chartTiposCurso = {
        series: [
          {
            name: 'Cantidad',
            data: [res.countCursos, res.countAgrupados, res.countTransversales], // Puedes reemplazar por res.data si deseas dinámico
          },
        ],
        chart: {
          type: 'bar',
          height: 350,
          toolbar: {
            show: true,
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true,
            borderRadius: 10,
            borderRadiusApplication: 'end',
            columnWidth: '60%',
          },
        },
        title: {
          text: '',
        },
        xaxis: {
          categories: ['Total', 'Transversales', 'Agrupados'],
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          show: true,
          width: 1,
          colors: ['transparent'],
        },
        colors: ['#3b82f6', '#facc15', '#a855f7'],
      };
    });
  }

  cargarEstadoTurno(): void {
    this.dashboardService.cargarEstadoTurno(this.n_codper).subscribe((res) => {
      this.chartTurnos = {
        series: [
          res.countTurnoEstado_0,
          res.countTurnoEstado_1,
          res.countTurnoEstado_2,
        ],
        chart: {
          type: 'donut',
          height: 350,
          animations: { enabled: true },
          toolbar: { show: true },
        },
        labels: ['No asignado', 'Pendiente', 'Asignado'],
        colors: ['#94a3b8', '#eab308', '#22c55e'],
        title: {
          text: '',
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          show: false,
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
                  formatter: () => '', // Si es dinámico: () => (80+30+10).toString()
                },
              },
            },
          },
        },
        responsive: [],
      };
    });
  }

  onChangePeriodo(nuevoPeriodo: string) {
    this.n_codper = nuevoPeriodo;
    this.cargarChartDocentes();
    this.loadDashboardData();
    this.cargarTipoCursos();
    this.cargarEstadoTurno();
  }
}

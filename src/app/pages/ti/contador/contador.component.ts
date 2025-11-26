import { Component, OnInit } from '@angular/core';
import { ContadorService } from '../../../services/contador.service';
import { ContadorResult } from '../../../interfaces/hr/hr_contador';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-contador',
  standalone: false,
  templateUrl: './contador.component.html',
  styleUrl: './contador.component.css',
})
export class ContadorComponent implements OnInit {
  contador: ContadorResult[] = [];
  contadorFiltrado: ContadorResult[] = [];
  search = '';

  // MODALES
  modalCrearVisible = false;
  modalEditarVisible = false;

  // Formulario
  formLimite: number | null = null;

  // Item seleccionado
  selectedItem: ContadorResult | null = null;

  constructor(
    private contadorService: ContadorService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.getContador();
  }

  getContador() {
    this.contadorService.getContador().subscribe((data) => {
      this.contador = data;
      this.contadorFiltrado = data;
    });
  }

  filtrar() {
    const term = this.search.toLowerCase().trim();
    this.contadorFiltrado = this.contador.filter(
      (item) =>
        item.courseid_temp.toLowerCase().includes(term) ||
        item.c_nomcur.toLowerCase().includes(term) ||
        item.c_codcur.toLowerCase().includes(term)
    );
  }

  // -----------------------
  // CREAR CONTADOR
  // -----------------------
  openCrear(item: ContadorResult) {
    this.selectedItem = item;
    this.formLimite = null;
    this.modalCrearVisible = true;
  }

  crearContador() {
    if (!this.formLimite || !this.selectedItem) return;

    this.alertService.showLoadingScreen('Creando contador...');

    this.contadorService
      .createContador({
        courseId: Number(this.selectedItem.courseid_temp),
        limite: this.formLimite,
      })
      .subscribe({
        next: () => {
          this.alertService.close();
          this.alertService.success(
            'Contador creado correctamente.',
            '¡Éxito!'
          );
          this.getContador();
          this.closeModal();
        },
        error: () => {
          this.alertService.close();
          this.alertService.error('No se pudo crear el contador.');
        },
      });
  }

  // -----------------------
  // EDITAR CONTADOR
  // -----------------------
  openEditar(item: ContadorResult) {
    this.selectedItem = item;
    this.formLimite = item.limite ?? null;
    this.modalEditarVisible = true;
  }

  editarContador() {
    if (!this.formLimite || !this.selectedItem?.id) return;

    this.alertService.showLoadingScreen('Actualizando contador...');

    this.contadorService
      .updateContador(this.selectedItem.id, this.formLimite)
      .subscribe({
        next: () => {
          this.alertService.close();
          this.alertService.success(
            'Límite actualizado correctamente.',
            '¡Éxito!'
          );
          this.getContador();
          this.closeModal();
        },
        error: () => {
          this.alertService.close();
          this.alertService.error('No se pudo actualizar el contador.');
        },
      });
  }

  closeModal() {
    this.modalCrearVisible = false;
    this.modalEditarVisible = false;
    this.selectedItem = null;
    this.formLimite = null;
  }
}

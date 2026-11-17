import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LogisticaPage } from './logistica.page';
describe('Logística conectada', () => {
  let http: HttpTestingController;
  let page: LogisticaPage;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogisticaPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { kind: 'solicitudes' } } } },
        { provide: AuthService, useValue: { can: () => true } },
      ],
    });
    page = TestBed.createComponent(LogisticaPage).componentInstance;
    http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/v1/mobile/solicitudes')
      .flush([{ id_solicitud: 1, destino: 'Almacén', estado: 'PENDIENTE', cantidad: 1 }]);
  });
  afterEach(() => http.verify());
  it('limita las transiciones según el estado de la solicitud', () => {
    expect(page.states({ estado: 'PENDIENTE' }, { key: 'estado', label: '' })).toEqual([
      'EN_PREPARACION',
      'RECHAZADA',
      'ANULADA',
    ]);
    expect(page.states({ estado: 'ATENDIDA' }, { key: 'estado', label: '' })).toEqual([]);
  });
  it('no permite asignar una unidad antes de entrar en preparación', () => {
    const assign = page.config.actions![1];
    expect(page.available(assign, { estado: 'PENDIENTE' })).toBe(false);
    expect(page.available(assign, { estado: 'EN_PREPARACION' })).toBe(true);
  });
  it('envía el estado al identificador seleccionado y actualiza tras guardar', () => {
    page.open(page.config.actions![0], page.rows()[0]);
    page.values = { estado: 'EN_PREPARACION', nota: 'Revisión de almacén' };
    page.save();
    const req = http.expectOne('/api/v1/mobile/solicitudes/1/estado');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.estado).toBe('EN_PREPARACION');
    req.flush({ ok: true });
    http.expectOne('/api/v1/mobile/solicitudes').flush([]);
    expect(page.action()).toBeNull();
    expect(page.success()).toContain('guardada');
  });
  it('conserva el formulario y explica el conflicto sin anunciar éxito', () => {
    page.open(page.config.actions![0], page.rows()[0]);
    page.values = { estado: 'EN_PREPARACION', nota: 'Intento de transición' };
    page.save();
    http
      .expectOne('/api/v1/mobile/solicitudes/1/estado')
      .flush(
        { error: 'Asigna todas las unidades antes de atender' },
        { status: 409, statusText: 'Conflict' },
      );
    expect(page.error()).toContain('Asigna todas');
    expect(page.success()).toBe('');
    expect(page.action()).not.toBeNull();
    expect(page.saving()).toBe(false);
  });
  it('impide enviar una operación sin motivo', () => {
    page.open(page.config.actions![0], page.rows()[0]);
    page.values = { estado: 'EN_PREPARACION', nota: '  ' };
    page.save();
    http.expectNone('/api/v1/mobile/solicitudes/1/estado');
    expect(page.error()).toContain('Completa');
  });
  it('filtra registros sin confundir el filtro local con una consulta al servidor', () => {
    page.filter('almacén');
    expect(page.filtered().length).toBe(1);
    page.filter('inexistente');
    expect(page.filtered().length).toBe(0);
  });
});

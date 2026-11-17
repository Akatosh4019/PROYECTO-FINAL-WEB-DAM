import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { apiError } from '../core/api-error';
import { Action, Field, MODULES } from '../core/logistica.config';
type Row = Record<string, any>;
@Component({
  selector: 'app-logistica-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './logistica.page.html',
  styleUrl: './logistica.page.css',
})
export class LogisticaPage {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);
  readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as string;
  readonly config = MODULES[this.kind];
  readonly rows = signal<Row[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly action = signal<Action | null>(null);
  readonly selected = signal<Row | null>(null);
  readonly history = signal<Row[] | null>(null);
  readonly historyLoading = signal(false);
  readonly historyId = signal<number | null>(null);
  readonly options = signal<Record<string, Row[]>>({});
  readonly search = signal('');
  readonly page = signal(0);
  readonly filtered = computed(() =>
    this.rows().filter((row) =>
      this.config.columns.some((c) =>
        String(row[c.key] ?? '')
          .toLowerCase()
          .includes(this.search().toLowerCase()),
      ),
    ),
  );
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 10)));
  readonly visible = computed(() => this.filtered().slice(this.page() * 10, this.page() * 10 + 10));
  values: Record<string, any> = {};
  constructor() {
    this.reload();
  }
  reload() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.http.get<Row[]>('/api/v1/mobile/' + this.kind).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.page.set(0);
        this.loading.set(false);
      },
      error: (e) => {
        this.rows.set([]);
        this.error.set(apiError(e));
        this.loading.set(false);
      },
    });
  }
  filter(value: string) {
    this.search.set(value);
    this.page.set(0);
  }
  id(row: Row) {
    return Number(row[this.config.id]);
  }
  display(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    return String(value);
  }
  open(action: Action, row: Row | null = null) {
    if (this.saving()) return;
    this.action.set(action);
    this.selected.set(row);
    this.error.set('');
    this.success.set('');
    this.history.set(null);
    this.values = {};
    action.fields.forEach((f) => (this.values[f.key] = f.options?.[0] ?? ''));
    if (action.path.endsWith('/estado') && row) {
      const choices = this.states(row, action.fields[0]);
      this.values['estado'] = choices[0] ?? '';
    }
    const requests: Record<string, Observable<Row[]>> = {};
    if (action.fields.some((f) => f.source === 'motocicletas'))
      requests['motocicletas'] = this.http.get<Row[]>('/api/v1/mobile/inventario');
    if (action.fields.some((f) => f.source === 'ubicaciones'))
      requests['ubicaciones'] = this.http.get<Row[]>('/api/v1/mobile/ubicaciones');
    if (Object.keys(requests).length)
      forkJoin(requests).subscribe({
        next: (o) => this.options.set(o),
        error: (e) => {
          this.error.set(apiError(e));
          this.action.set(null);
        },
      });
    if (action.path.endsWith('/correccion') && row) {
      this.http.get<Row[]>('/api/v1/mobile/inventario').subscribe({
        next: (items) => {
          const m = items.find((x) => x['id_motocicleta'] === row['id_motocicleta']);
          if (m) {
            for (const k of ['marca', 'modelo', 'color', 'dua']) this.values[k] = m[k];
            this.values['chasis'] = m['chasis_completo'];
            this.values['motor'] = m['numero_motor'];
            this.values['item'] = m['item_dua'];
          }
        },
        error: (e) => this.error.set(apiError(e)),
      });
    }
  }
  states(row: Row, field: Field): string[] {
    if (field.key !== 'estado') return field.options ?? [];
    if (this.kind === 'solicitudes')
      return row['estado'] === 'PENDIENTE'
        ? ['EN_PREPARACION', 'RECHAZADA', 'ANULADA']
        : row['estado'] === 'EN_PREPARACION'
          ? ['ATENDIDA', 'ANULADA']
          : [];
    if (this.kind === 'inconsistencias')
      return row['estado'] === 'ABIERTA'
        ? ['EN_REVISION']
        : row['estado'] === 'EN_REVISION'
          ? ['RESUELTA']
          : [];
    return field.options ?? [];
  }
  choices(field: Field) {
    return this.selected() ? this.states(this.selected()!, field) : (field.options ?? []);
  }
  available(action: Action, row: Row) {
    if (!this.auth.can(action.permission)) return false;
    if (action.path.endsWith('/unidades')) return row['estado'] === 'EN_PREPARACION';
    if (action.path.endsWith('/correccion')) return row['estado'] === 'EN_REVISION';
    if (action.path.endsWith('/estado')) return this.states(row, action.fields[0]).length > 0;
    return true;
  }
  lookup(field: Field) {
    return (this.options()[field.source ?? ''] ?? []).filter(
      (r) => field.source !== 'ubicaciones' || r['activo'] === true,
    );
  }
  optionId(field: Field, row: Row) {
    return Number(row[field.source === 'ubicaciones' ? 'id_ubicacion' : 'id_motocicleta']);
  }
  optionLabel(field: Field, row: Row) {
    return field.source === 'ubicaciones'
      ? row['codigo'] + ' · ' + row['nombre']
      : '#' +
          row['id_motocicleta'] +
          ' · ' +
          row['marca'] +
          ' ' +
          row['modelo'] +
          ' · ' +
          row['chasis_completo'];
  }
  save() {
    const a = this.action();
    if (!a || this.saving()) return;
    const payload: Row = {};
    for (const f of a.fields) {
      const raw = this.values[f.key];
      if (raw === undefined || raw === null || String(raw).trim() === '') {
        this.error.set('Completa ' + f.label.toLowerCase() + '.');
        return;
      }
      payload[f.key] = f.type === 'number' ? Number(raw) : String(raw).trim();
      if (f.type === 'number' && (!Number.isSafeInteger(payload[f.key]) || payload[f.key] < 1)) {
        this.error.set('Selecciona un valor válido para ' + f.label.toLowerCase() + '.');
        return;
      }
    }
    if (payload['cantidad'] > 10000) {
      this.error.set('La cantidad máxima es 10000.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const path = a.path.replace(':id', String(this.selected() ? this.id(this.selected()!) : ''));
    this.http.post('/api/v1/mobile/' + path, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.action.set(null);
        this.success.set('Operación guardada correctamente.');
        this.reload();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(apiError(e));
      },
    });
  }
  showHistory(row: Row) {
    this.history.set(null);
    this.historyId.set(this.id(row));
    this.historyLoading.set(true);
    this.error.set('');
    this.http
      .get<Row[]>('/api/v1/mobile/' + this.kind + '/' + this.id(row) + '/historial')
      .subscribe({
        next: (h) => {
          this.history.set(h);
          this.historyLoading.set(false);
        },
        error: (e) => {
          this.error.set(apiError(e));
          this.historyLoading.set(false);
        },
      });
  }
}

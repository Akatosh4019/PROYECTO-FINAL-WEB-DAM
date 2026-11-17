export interface Field {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  source?: 'motocicletas' | 'ubicaciones';
}
export interface Action {
  label: string;
  permission: string;
  path: string;
  fields: Field[];
}
export interface Module {
  title: string;
  description: string;
  id: string;
  columns: { key: string; label: string }[];
  create?: Action;
  actions?: Action[];
  history?: boolean;
}
const text = (key: string, label: string): Field => ({ key, label });
const note: Field = { key: 'nota', label: 'Motivo / observación', type: 'textarea' };
const moto: Field = {
  key: 'motocicletaId',
  label: 'Motocicleta',
  source: 'motocicletas',
  type: 'number',
};
const target: Field = {
  key: 'destinoId',
  label: 'Ubicación de destino',
  source: 'ubicaciones',
  type: 'number',
};
export const MODULES: Record<string, Module> = {
  ubicaciones: {
    title: 'Ubicaciones',
    description: 'Organiza los almacenes, tiendas y talleres de la empresa.',
    id: 'id_ubicacion',
    columns: [
      { key: 'codigo', label: 'Código' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'activo', label: 'Activa' },
    ],
    create: {
      label: 'Nueva ubicación',
      permission: 'LOGISTICA_GESTIONAR',
      path: 'ubicaciones',
      fields: [
        text('codigo', 'Código'),
        text('nombre', 'Nombre'),
        { key: 'tipo', label: 'Tipo', options: ['ALMACEN', 'TIENDA', 'TALLER'] },
      ],
    },
  },
  movimientos: {
    title: 'Movimientos',
    description: 'Registra la primera ubicación o un traslado y conserva su trazabilidad.',
    id: 'id_movimiento',
    columns: [
      { key: 'chasis_completo', label: 'Chasis' },
      { key: 'tipo', label: 'Movimiento' },
      { key: 'origen', label: 'Origen' },
      { key: 'destino', label: 'Destino' },
      { key: 'ocurrido_en', label: 'Fecha' },
      { key: 'observacion', label: 'Observación' },
    ],
    create: {
      label: 'Registrar movimiento',
      permission: 'LOGISTICA_GESTIONAR',
      path: 'movimientos',
      fields: [moto, target, note],
    },
  },
  solicitudes: {
    title: 'Solicitudes de ensamblaje',
    description: 'Crea solicitudes, asigna unidades y registra cada cambio de estado.',
    id: 'id_solicitud',
    columns: [
      { key: 'destino', label: 'Destino' },
      { key: 'cantidad', label: 'Cantidad' },
      { key: 'estado', label: 'Estado' },
      { key: 'observacion', label: 'Observación' },
    ],
    history: true,
    create: {
      label: 'Nueva solicitud',
      permission: 'SOLICITUDES_CREAR',
      path: 'solicitudes',
      fields: [
        target,
        text('marca', 'Marca'),
        text('modelo', 'Modelo'),
        text('color', 'Color'),
        { key: 'cantidad', label: 'Cantidad', type: 'number' },
        note,
      ],
    },
    actions: [
      {
        label: 'Cambiar estado',
        permission: 'SOLICITUDES_ATENDER',
        path: 'solicitudes/:id/estado',
        fields: [
          {
            key: 'estado',
            label: 'Nuevo estado',
            options: ['EN_PREPARACION', 'ATENDIDA', 'RECHAZADA', 'ANULADA'],
          },
          note,
        ],
      },
      {
        label: 'Asignar unidad',
        permission: 'SOLICITUDES_ATENDER',
        path: 'solicitudes/:id/unidades',
        fields: [moto],
      },
    ],
  },
  inventario: {
    title: 'Disponibilidad',
    description: 'Consulta la ubicación actual y registra restricciones de disponibilidad.',
    id: 'id_motocicleta',
    columns: [
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'color', label: 'Color' },
      { key: 'chasis_completo', label: 'Chasis' },
      { key: 'ubicacion', label: 'Ubicación' },
      { key: 'disponibilidad', label: 'Disponibilidad' },
    ],
    history: true,
    actions: [
      {
        label: 'Disponibilidad',
        permission: 'DISPONIBILIDAD_GESTIONAR',
        path: 'inventario/:id/disponibilidad',
        fields: [
          { key: 'estado', label: 'Estado', options: ['DISPONIBLE', 'NO_DISPONIBLE'] },
          note,
        ],
      },
    ],
  },
  inconsistencias: {
    title: 'Inconsistencias',
    description: 'Reporta problemas, revisa la ficha y conserva el historial de correcciones.',
    id: 'id_inconsistencia',
    columns: [
      { key: 'chasis_completo', label: 'Chasis' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'estado', label: 'Estado' },
      { key: 'nota', label: 'Última nota' },
    ],
    history: true,
    create: {
      label: 'Reportar inconsistencia',
      permission: 'INCONSISTENCIAS_REPORTAR',
      path: 'inconsistencias',
      fields: [moto, { key: 'descripcion', label: 'Descripción', type: 'textarea' }],
    },
    actions: [
      {
        label: 'Cambiar estado',
        permission: 'INCONSISTENCIAS_RESOLVER',
        path: 'inconsistencias/:id/estado',
        fields: [
          { key: 'estado', label: 'Nuevo estado', options: ['EN_REVISION', 'RESUELTA'] },
          note,
        ],
      },
      {
        label: 'Corregir ficha',
        permission: 'INCONSISTENCIAS_RESOLVER',
        path: 'inconsistencias/:id/correccion',
        fields: [
          text('marca', 'Marca'),
          text('modelo', 'Modelo'),
          text('color', 'Color'),
          text('chasis', 'Chasis completo'),
          text('motor', 'Número de motor'),
          text('dua', 'DUA'),
          text('item', 'Ítem DUA'),
          note,
        ],
      },
    ],
  },
  llegadas: {
    title: 'Historial de llegadas',
    description: 'Consulta las recepciones registradas por el equipo.',
    id: 'id_llegada',
    columns: [
      { key: 'numero_guia', label: 'Guía' },
      { key: 'cantidad_declarada', label: 'Declaradas' },
      { key: 'cantidad_recibida', label: 'Recibidas' },
      { key: 'observacion', label: 'Observación' },
    ],
  },
  usuarios: {
    title: 'Directorio de trabajadores',
    description: 'Consulta los identificadores de cuenta para administrar sus permisos.',
    id: 'id_usuario',
    columns: [
      { key: 'nombre_completo', label: 'Nombre' },
      { key: 'nombre_usuario', label: 'Usuario' },
      { key: 'rol', label: 'Rol' },
      { key: 'estado', label: 'Estado' },
    ],
  },
};

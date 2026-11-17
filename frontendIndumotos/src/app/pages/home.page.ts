import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <div class="eyebrow">PLATAFORMA DE OPERACIONES</div>
    <h1>Todo empieza con una unidad.</h1>
    <p class="lead">
      Bienvenido, {{ auth.username() }}. Gestiona la recepción, el inventario y la preparación de
      motocicletas con información compartida entre web y móvil.
    </p>
    <div class="workflow">
      <span>01 · Recepción</span><span>02 · Inventario</span><span>03 · Logística</span
      ><span>04 · Ensamblaje</span>
    </div>
    <div class="cards">
      @for (card of cards; track card.path) {
        @if (auth.can(card.permission)) {
          <a [routerLink]="'/app/' + card.path"
            ><span class="card-index">{{ card.number }} / {{ card.category }}</span>
            <h2>{{ card.title }}</h2>
            <p>{{ card.copy }}</p>
            <span class="open">Abrir módulo →</span></a
          >
        }
      }
    </div>
    <div class="footnote">
      Cada operación se registra en el servidor con la cuenta que la realiza. Los accesos dependen
      de tu rol y tus permisos efectivos.
    </div>
  `,
  styles: [
    `
      .eyebrow {
        color: #da5437;
        font-size: 11px;
        letter-spacing: 0.14em;
        font-weight: 800;
      }
      h1 {
        font-size: 38px;
        letter-spacing: -0.05em;
        margin: 15px 0 12px;
      }
      .lead {
        color: #748295;
        line-height: 1.7;
        max-width: 740px;
      }
      .workflow {
        display: flex;
        flex-wrap: wrap;
        gap: 25px;
        border-block: 1px solid #e1e7ee;
        padding: 20px 0;
        margin: 28px 0;
        color: #7d8b9c;
        font-size: 12px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }
      .cards a {
        display: flex;
        flex-direction: column;
        background: #fff;
        border: 1px solid #e1e7ee;
        padding: 25px;
        border-radius: 12px;
        text-decoration: none;
        color: #243246;
        min-height: 235px;
        transition: border-color 0.15s;
      }
      .cards a:hover {
        border-color: #e4846b;
      }
      .card-index {
        color: #be6a51;
        letter-spacing: 0.07em;
        font-size: 10px;
        font-weight: 700;
      }
      h2 {
        font-size: 19px;
        margin: 24px 0 0;
      }
      .cards p {
        font-size: 13px;
        color: #7c8b9d;
        line-height: 1.7;
      }
      .open {
        font-size: 12px;
        color: #d7583b;
        font-weight: 700;
        margin-top: auto;
        padding-top: 10px;
      }
      .footnote {
        font-size: 12px;
        line-height: 1.7;
        color: #8c98a7;
        margin-top: 25px;
      }
      @media (max-width: 1000px) {
        .cards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 560px) {
        .cards {
          grid-template-columns: 1fr;
        }
        h1 {
          font-size: 30px;
        }
      }
    `,
  ],
})
export class HomePage {
  readonly auth = inject(AuthService);
  readonly cards = [
    {
      number: '01',
      category: 'RECEPCIÓN',
      title: 'Llegadas y guías',
      path: 'llegadas',
      permission: 'LLEGADAS_REGISTRAR',
      copy: 'Registra lo recibido y contrasta las cantidades con la guía.',
    },
    {
      number: '02',
      category: 'REGISTRO',
      title: 'Fichas de motocicletas',
      path: 'fichas',
      permission: 'FICHAS_REGISTRAR',
      copy: 'Vincula el chasis, motor y documentos con su recepción.',
    },
    {
      number: '03',
      category: 'INVENTARIO',
      title: 'Consulta de unidades',
      path: 'inventario',
      permission: 'INVENTARIO_CONSULTAR',
      copy: 'Encuentra motocicletas por chasis, marca, modelo o color.',
    },
    {
      number: '04',
      category: 'LOGÍSTICA',
      title: 'Ubicaciones y traslados',
      path: 'movimientos',
      permission: 'INVENTARIO_CONSULTAR',
      copy: 'Consulta y registra el recorrido de cada unidad.',
    },
    {
      number: '05',
      category: 'ENSAMBLAJE',
      title: 'Solicitudes',
      path: 'solicitudes',
      permission: 'INVENTARIO_CONSULTAR',
      copy: 'Solicita unidades y sigue su preparación hasta la atención.',
    },
    {
      number: '06',
      category: 'CONTROL',
      title: 'Disponibilidad',
      path: 'disponibilidad',
      permission: 'INVENTARIO_CONSULTAR',
      copy: 'Revisa la última ubicación informada y la disponibilidad.',
    },
    {
      number: '07',
      category: 'CALIDAD',
      title: 'Inconsistencias',
      path: 'inconsistencias',
      permission: 'INVENTARIO_CONSULTAR',
      copy: 'Reporta diferencias y conserva las correcciones de la ficha.',
    },
    {
      number: '08',
      category: 'PERSONAL',
      title: 'Trabajadores',
      path: 'directorio',
      permission: 'PERMISOS_ASIGNAR',
      copy: 'Consulta las cuentas, sus roles y su identificador.',
    },
    {
      number: '09',
      category: 'ACCESO',
      title: 'Roles y permisos',
      path: 'permisos',
      permission: 'PERMISOS_ASIGNAR',
      copy: 'Gestiona los permisos efectivos y excepciones por trabajador.',
    },
  ];
}

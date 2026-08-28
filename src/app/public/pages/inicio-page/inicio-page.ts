import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/* ============================================================================
 * ⚠️  DATOS DE CONTACTO — completar antes de publicar
 * ----------------------------------------------------------------------------
 * Mientras estos campos estén vacíos, la sección de contacto muestra un aviso
 * en lugar de los enlaces, y el formulario avisa que no hay canal configurado.
 *
 *   whatsapp: solo dígitos, con código de país y sin signos. Ej: '50255551234'
 *   correo:   dirección a la que deben llegar los pedidos
 * ========================================================================== */
export const CONTACTO = {
  whatsapp: '',
  correo: '',
  telefono: '',
  direccion: 'Centro Universitario de Occidente, Quetzaltenango, Guatemala',
  horario: 'Lunes a viernes, de 8:00 a 17:00',
};

export interface FormPedido {
  nombre: string;
  contacto: string;
  producto: string;
  cantidad: string;
  mensaje: string;
}

export interface ProductoLab {
  id: 'camisas' | 'tazas' | 'gorras' | 'llaveros' | 'tejido';
  nombre: string;
  resumen: string;
  detalles: string[];
  /** Al agregar la fotografía, poner aquí la ruta (ej. 'productos/camisas.jpg')
   *  dentro de la carpeta `public/`. Si está vacío se dibuja la ilustración. */
  imagen?: string;
}

/** Página pública del Laboratorio de Ingeniería Industrial (CUNOC-USAC). */
@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InicioPageComponent {
  contacto = CONTACTO;
  anio = new Date().getFullYear();

  menuAbierto = signal(false);
  enviado = signal(false);
  sinCanal = signal(false);

  productos = signal<ProductoLab[]>([
    {
      id: 'camisas',
      nombre: 'Camisas sublimadas',
      resumen: 'Playeras personalizadas con tu diseño impreso a todo color.',
      detalles: ['Diseño a full color', 'Piezas sueltas o por lote', 'Uniformes y eventos'],
    },
    {
      id: 'tazas',
      nombre: 'Tazas personalizadas',
      resumen: 'Tazas sublimadas para regalo, promoción o recuerdo.',
      detalles: ['Impresión envolvente', 'Ideal para obsequios', 'Pedidos por unidad'],
    },
    {
      id: 'gorras',
      nombre: 'Gorras',
      resumen: 'Gorras con sublimación, para equipos, cursos y promocionales.',
      detalles: ['Frente personalizado', 'Colores a elección', 'Lotes para grupos'],
    },
    {
      id: 'llaveros',
      nombre: 'Llaveros',
      resumen: 'Llaveros personalizados con logotipo, nombre o ilustración.',
      detalles: ['Varias formas y tamaños', 'Excelente para souvenirs', 'Producción rápida'],
    },
    {
      id: 'tejido',
      nombre: 'Tejido industrial',
      resumen:
        'Piezas tejidas en máquina industrial a partir de la imagen que nos compartas.',
      detalles: ['Se carga la imagen al equipo', 'Diseños de cualquier tipo', 'Acabado industrial'],
    },
  ]);

  pasos = [
    {
      titulo: 'Contanos tu idea',
      texto: 'Escribinos qué producto querés, la cantidad y el diseño que tenés en mente.',
    },
    {
      titulo: 'Cotización',
      texto: 'Revisamos la propuesta, confirmamos materiales y te pasamos el precio.',
    },
    {
      titulo: 'Producción',
      texto: 'El pedido se elabora en el laboratorio con el equipo de sublimación y tejido.',
    },
    {
      titulo: 'Entrega',
      texto: 'Coordinamos la entrega en el Centro Universitario de Occidente.',
    },
  ];

  /** Hay al menos un canal de contacto configurado. */
  hayCanal = computed(() => !!this.contacto.whatsapp || !!this.contacto.correo);

  // --------------------------------------------------------------- Formulario
  form = signal<FormPedido>({
    nombre: '',
    contacto: '',
    producto: '',
    cantidad: '',
    mensaje: '',
  });

  actualizar(campo: keyof FormPedido, valor: string) {
    this.form.update((f) => ({ ...f, [campo]: valor }));
    this.enviado.set(false);
    this.sinCanal.set(false);
  }

  formValido = computed(() => {
    const f = this.form();
    return f.nombre.trim().length > 1 && f.contacto.trim().length > 4;
  });

  /** Arma el texto del pedido para WhatsApp o correo. */
  private mensajeArmado(): string {
    const f = this.form();
    const lineas = [
      'Hola, quiero hacer un pedido en el Laboratorio de Ingeniería Industrial.',
      '',
      `Nombre: ${f.nombre.trim()}`,
      `Contacto: ${f.contacto.trim()}`,
    ];
    if (f.producto) lineas.push(`Producto: ${f.producto}`);
    if (f.cantidad) lineas.push(`Cantidad: ${f.cantidad}`);
    if (f.mensaje.trim()) {
      lineas.push('', 'Detalle:', f.mensaje.trim());
    }
    return lineas.join('\n');
  }

  /**
   * Abre WhatsApp con el pedido ya redactado. Si no hay número configurado,
   * cae al correo; si tampoco hay, avisa en pantalla.
   */
  enviarPedido(evento?: Event) {
    evento?.preventDefault();
    if (!this.formValido()) return;

    const texto = this.mensajeArmado();

    if (this.contacto.whatsapp) {
      window.open(
        `https://wa.me/${this.contacto.whatsapp}?text=${encodeURIComponent(texto)}`,
        '_blank',
        'noopener',
      );
      this.enviado.set(true);
      return;
    }

    if (this.contacto.correo) {
      const asunto = encodeURIComponent('Pedido — Laboratorio de Ingeniería Industrial');
      window.location.href =
        `mailto:${this.contacto.correo}?subject=${asunto}&body=${encodeURIComponent(texto)}`;
      this.enviado.set(true);
      return;
    }

    this.sinCanal.set(true);
  }

  /** Enlace de WhatsApp sin datos del formulario, para el botón del encabezado. */
  enlaceWhatsApp(): string {
    const texto = encodeURIComponent(
      'Hola, me interesa hacer un pedido en el Laboratorio de Ingeniería Industrial.',
    );
    return `https://wa.me/${this.contacto.whatsapp}?text=${texto}`;
  }

  alternarMenu() {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }
}

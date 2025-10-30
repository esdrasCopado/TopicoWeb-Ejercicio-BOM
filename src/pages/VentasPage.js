import { NavBar } from "../components/NavBar.js";
import { get, post, put, deleteRequest } from "../utils/appi.js";

export class VentasPage {
    constructor(params) {
        this.params = params;
        this.navBar = new NavBar({ brand: 'MyApp', currentPath: window.location.pathname });
        this.ventas = [];
        this.productos = [];
        this.editingId = null;

        // Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    async loadVentas() {
        const { data, error } = await get('/ventas');

        if (error) {
            console.error('Error cargando ventas:', error);
            alert('Error al cargar ventas');
            return;
        }

        this.ventas = data;
        this.renderVentas();
    }

    async loadProductos() {
        const { data, error } = await get('/productos');

        if (error) {
            console.error('Error cargando productos:', error);
            return;
        }

        this.productos = data;
        this.renderProductoSelect();
    }

    renderProductoSelect() {
        const select = document.getElementById('productoId');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccione un producto</option>' +
            this.productos.map(producto => {
                const id = producto.id || producto._id;
                return `<option value="${id}">${producto.nombre} - $${producto.precio.toFixed(2)}</option>`;
            }).join('');
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const productoId = formData.get('productoId');
        const cantidad = parseInt(formData.get('cantidad'));

        // Validar que se seleccionó un producto
        if (!productoId) {
            alert('Por favor seleccione un producto');
            return;
        }

        // Buscar el producto seleccionado
        const producto = this.productos.find(p =>
            (p.id && p.id === productoId) || (p._id && p._id === productoId)
        );

        if (!producto) {
            alert('Producto no encontrado');
            return;
        }

        // Calcular valores
        const precioVenta = producto.precio;
        const subtotal = precioVenta * cantidad;
        const ivaRate = 0.16; // 16% de IVA (puedes ajustar esto)
        const iva = subtotal * ivaRate;
        const total = subtotal + iva;

        // Construir el objeto en el formato que espera el backend
        const ventaData = {
            total: total,
            iva: iva,
            productosventa: [
                {
                    idProducto: productoId,
                    descripcion: producto.nombre,
                    precioVenta: precioVenta,
                    cantidad: cantidad,
                    subtotal: subtotal
                }
            ]
        };

        if (this.editingId) {
            // Actualizar venta existente
            const { data, error } = await put(`/ventas/${this.editingId}`, ventaData);

            if (error) {
                console.error('Error actualizando venta:', error);
                alert('Error al actualizar venta');
                return;
            }

            console.log('Venta actualizada:', data);
            this.editingId = null;
        } else {
            // Crear nueva venta
            const { data, error } = await post('/ventas', ventaData);

            if (error) {
                console.error('Error creando venta:', error);
                alert('Error al crear venta');
                return;
            }

            console.log('Venta creada:', data);
        }

        // Limpiar formulario y recargar ventas
        event.target.reset();
        await this.loadVentas();
    }

    async handleEdit(id) {
        const venta = this.ventas.find(v => v.id === id || v._id === id);

        if (!venta) return;

        // Obtener el primer producto de la venta (asumiendo una venta con un solo producto)
        const productoVenta = venta.productosventa && venta.productosventa[0];

        if (!productoVenta) {
            alert('No se pudo cargar la información de la venta');
            return;
        }

        // Llenar el formulario con los datos de la venta
        const productoId = productoVenta.idProducto || productoVenta.idProducto?._id;
        document.getElementById('productoId').value = productoId;
        document.getElementById('cantidad').value = productoVenta.cantidad;

        // Calcular y mostrar valores
        const subtotal = productoVenta.subtotal || 0;
        const iva = venta.iva || 0;
        const total = venta.total || 0;

        document.getElementById('subtotal').value = subtotal.toFixed(2);
        document.getElementById('iva').value = iva.toFixed(2);
        document.getElementById('total').value = total.toFixed(2);

        // Cambiar el texto del botón
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Actualizar Venta';

        // Mostrar botón de cancelar
        document.getElementById('cancel-btn').style.display = 'inline-block';

        this.editingId = venta.id || venta._id;
    }

    handleCancel() {
        // Limpiar formulario
        document.querySelector('form').reset();

        // Resetear estado de edición
        this.editingId = null;

        // Cambiar el texto del botón
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Registrar Venta';

        // Ocultar botón de cancelar
        document.getElementById('cancel-btn').style.display = 'none';
    }

    async handleDelete(id) {
        if (!confirm('¿Estás seguro de eliminar esta venta?')) {
            return;
        }

        const { data, error } = await deleteRequest(`/ventas/${id}`);

        if (error) {
            console.error('Error eliminando venta:', error);
            alert('Error al eliminar venta');
            return;
        }

        console.log('Venta eliminada:', data);
        await this.loadVentas();
    }

    handleProductoChange() {
        const productoId = document.getElementById('productoId').value;
        const cantidad = parseInt(document.getElementById('cantidad').value) || 1;

        if (!productoId) {
            document.getElementById('subtotal').value = '';
            document.getElementById('iva').value = '';
            document.getElementById('total').value = '';
            return;
        }

        const producto = this.productos.find(p =>
            (p.id && p.id === productoId) || (p._id && p._id === productoId)
        );

        if (producto) {
            const subtotal = producto.precio * cantidad;
            const ivaRate = 0.16; // 16% de IVA
            const iva = subtotal * ivaRate;
            const total = subtotal + iva;

            document.getElementById('subtotal').value = subtotal.toFixed(2);
            document.getElementById('iva').value = iva.toFixed(2);
            document.getElementById('total').value = total.toFixed(2);
        }
    }

    renderVentas() {
        const tbody = document.getElementById('ventas-tbody');

        if (!tbody) return;

        if (this.ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay ventas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = this.ventas.map(venta => {
            const id = venta.id || venta._id;
            const fecha = venta.fecha ? new Date(venta.fecha).toLocaleDateString() : 'N/A';

            // Obtener información del primer producto (asumiendo una venta con un solo producto)
            const productoVenta = venta.productosventa && venta.productosventa[0];
            const productoNombre = productoVenta?.descripcion || 'N/A';
            const cantidad = productoVenta?.cantidad || 0;

            return `
                <tr>
                    <td>${fecha}</td>
                    <td>${productoNombre}</td>
                    <td>${cantidad}</td>
                    <td>$${venta.total ? venta.total.toFixed(2) : '0.00'}</td>
                    <td>
                        <button class="btn-edit" data-id="${id}">Editar</button>
                        <button class="btn-delete" data-id="${id}">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Conectar eventos de los botones
        this.attachTableEvents();
    }

    attachTableEvents() {
        // Botones de editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.handleEdit(id);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.handleDelete(id);
            });
        });
    }

    renderForm() {
        return `
            <div class="ventas-form">
                <h2>Registrar Venta</h2>
                <form id="venta-form">
                    <div class="form-group">
                        <label for="productoId">Producto:</label>
                        <select id="productoId" name="productoId" required>
                            <option value="">Seleccione un producto</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="cantidad">Cantidad:</label>
                        <input type="number" id="cantidad" name="cantidad" min="1" value="1" required>
                    </div>
                    <div class="form-group">
                        <label for="subtotal">Subtotal:</label>
                        <input type="number" id="subtotal" name="subtotal" step="0.01" min="0" readonly>
                    </div>
                    <div class="form-group">
                        <label for="iva">IVA (16%):</label>
                        <input type="number" id="iva" name="iva" step="0.01" min="0" readonly>
                    </div>
                    <div class="form-group">
                        <label for="total">Total:</label>
                        <input type="number" id="total" name="total" step="0.01" min="0" readonly>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Registrar Venta</button>
                        <button type="button" id="cancel-btn" style="display: none;">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderTable() {
        return `
            <div class="ventas-table">
                <h2>Historial de Ventas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="ventas-tbody">
                        <tr><td colspan="6" style="text-align: center;">Cargando...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    render() {
        return `
            ${this.navBar.render()}
            <div class="ventas-page">
                <h1>Ventas</h1>
                <div class="ventas-container">
                    ${this.renderForm()}
                    ${this.renderTable()}
                </div>
            </div>
        `;
    }

    async afterRender() {
        // Inicializar el NavBar
        this.navBar.afterRender();

        // Conectar el evento submit del formulario
        const form = document.getElementById('venta-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }

        // Conectar el botón de cancelar
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.handleCancel);
        }

        // Conectar eventos de cambio en el select de producto y cantidad
        const productoSelect = document.getElementById('productoId');
        const cantidadInput = document.getElementById('cantidad');

        if (productoSelect) {
            productoSelect.addEventListener('change', () => this.handleProductoChange());
        }

        if (cantidadInput) {
            cantidadInput.addEventListener('input', () => this.handleProductoChange());
        }

        // Cargar datos
        await this.loadProductos();
        await this.loadVentas();
    }
}

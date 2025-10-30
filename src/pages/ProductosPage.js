import { NavBar } from "../components/NavBar.js";
import { get, post, put, deleteRequest } from "../utils/appi.js";

export class ProductosPage {
    constructor(params) {
        this.params = params;
        this.navBar = new NavBar({ brand: 'MyApp', currentPath: window.location.pathname });
        this.productos = [];
        this.editingId = null;

        // Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    async loadProductos() {
        const { data, error } = await get('/productos');

        if (error) {
            console.error('Error cargando productos:', error);
            alert('Error al cargar productos');
            return;
        }

        this.productos = data;
        this.renderProductos();
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const productoData = {
            nombre: formData.get('nombre'),
            precio: parseFloat(formData.get('precio')),
            cantidad: parseInt(formData.get('cantidad'))
        };

        if (this.editingId) {
            // Actualizar producto existente
            const { data, error } = await put(`/productos/${this.editingId}`, productoData);

            if (error) {
                console.error('Error actualizando producto:', error);
                alert('Error al actualizar producto');
                return;
            }

            console.log('Producto actualizado:', data);
            this.editingId = null;
        } else {
            // Crear nuevo producto
            const { data, error } = await post('/productos', productoData);

            if (error) {
                console.error('Error creando producto:', error);
                alert('Error al crear producto');
                return;
            }

            console.log('Producto creado:', data);
        }

        // Limpiar formulario y recargar productos
        event.target.reset();
        await this.loadProductos();
    }

    async handleEdit(id) {
        const producto = this.productos.find(p => p.id === id || p._id === id);

        if (!producto) return;

        // Llenar el formulario con los datos del producto
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('cantidad').value = producto.cantidad;

        // Cambiar el texto del botón
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Actualizar Producto';

        // Mostrar botón de cancelar
        document.getElementById('cancel-btn').style.display = 'inline-block';

        this.editingId = producto.id || producto._id;
    }

    handleCancel() {
        // Limpiar formulario
        document.querySelector('form').reset();

        // Resetear estado de edición
        this.editingId = null;

        // Cambiar el texto del botón
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Agregar Producto';

        // Ocultar botón de cancelar
        document.getElementById('cancel-btn').style.display = 'none';
    }

    async handleDelete(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) {
            return;
        }

        const { data, error } = await deleteRequest(`/productos/${id}`);

        if (error) {
            console.error('Error eliminando producto:', error);
            alert('Error al eliminar producto');
            return;
        }

        console.log('Producto eliminado:', data);
        await this.loadProductos();
    }

    renderProductos() {
        const tbody = document.getElementById('productos-tbody');

        if (!tbody) return;

        if (this.productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos disponibles</td></tr>';
            return;
        }

        tbody.innerHTML = this.productos.map(producto => {
            const id = producto.id || producto._id;
            return `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${producto.cantidad}</td>
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
            <div class="productos-form">
                <h2>Gestión de Productos</h2>
                <form id="producto-form">
                    <div class="form-group">
                        <label for="nombre">Nombre:</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="form-group">
                        <label for="precio">Precio:</label>
                        <input type="number" id="precio" name="precio" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="cantidad">Cantidad:</label>
                        <input type="number" id="cantidad" name="cantidad" min="0" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Agregar Producto</button>
                        <button type="button" id="cancel-btn" style="display: none;">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderTable() {
        return `
            <div class="productos-table">
                <h2>Lista de Productos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="productos-tbody">
                        <tr><td colspan="5" style="text-align: center;">Cargando...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    render() {
        return `
            ${this.navBar.render()}
            <div class="productos-page">
                <h1>Productos</h1>
                <div class="productos-container">
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
        const form = document.getElementById('producto-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }

        // Conectar el botón de cancelar
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.handleCancel);
        }

        // Cargar productos
        await this.loadProductos();
    }
}

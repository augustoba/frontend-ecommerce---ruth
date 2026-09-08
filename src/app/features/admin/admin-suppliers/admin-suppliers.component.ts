import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/supplier.service';
import { ProductService } from '../../../core/services/product.service';
import { Supplier, SupplierInput } from '../../../core/models/supplier.model';
import { Product, margin } from '../../../core/models/product.model';

interface Draft {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

const EMPTY: Draft = { name: '', phone: '', address: '', notes: '' };

@Component({
  selector: 'app-admin-suppliers',
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './admin-suppliers.component.html',
  styleUrl: './admin-suppliers.component.css',
})
export class AdminSuppliersComponent {
  private readonly supplierService = inject(SupplierService);
  private readonly productService = inject(ProductService);

  readonly suppliers = this.supplierService.suppliers;

  /** id del proveedor en edición, o null si el form está en modo "nuevo" */
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<Draft>({ ...EMPTY });
  readonly error = signal<string | null>(null);

  readonly isEditing = computed(() => this.editingId() !== null);

  /** Prendas asociadas al proveedor que se está editando */
  readonly editingProducts = computed<Product[]>(() => {
    const id = this.editingId();
    if (!id) return [];
    return this.productService.products().filter((p) => p.supplierId === id);
  });

  productCount(id: string): number {
    return this.productService.products().filter((p) => p.supplierId === id).length;
  }

  marginOf(product: Product) {
    return margin(product);
  }

  /** Link a WhatsApp si el teléfono tiene pinta de número argentino */
  waLink(phone: string | undefined): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 8 ? `https://wa.me/${digits}` : null;
  }

  startNew(): void {
    this.editingId.set(null);
    this.draft.set({ ...EMPTY });
    this.error.set(null);
  }

  startEdit(s: Supplier): void {
    this.editingId.set(s.id);
    this.draft.set({
      name: s.name,
      phone: s.phone ?? '',
      address: s.address ?? '',
      notes: s.notes ?? '',
    });
    this.error.set(null);
  }

  patch<K extends keyof Draft>(key: K, value: string): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    this.error.set(null);
    const d = this.draft();
    if (d.name.trim().length < 2) {
      this.error.set('Poné un nombre de al menos 2 caracteres.');
      return;
    }
    const input: SupplierInput = {
      name: d.name,
      phone: d.phone,
      address: d.address,
      notes: d.notes,
    };
    const id = this.editingId();
    if (id) {
      this.supplierService.update(id, input);
    } else {
      this.supplierService.add(input);
    }
    this.startNew();
  }

  remove(s: Supplier): void {
    if (
      window.confirm(
        `¿Eliminar el proveedor "${s.name}"? Las prendas asociadas se quedan sin proveedor (no se borran).`
      )
    ) {
      this.supplierService.remove(s.id);
      if (this.editingId() === s.id) this.startNew();
    }
  }
}

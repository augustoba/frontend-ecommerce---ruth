import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

/**
 * Trae el producto a editar antes de entrar al form. Para "nuevo" (sin :id)
 * devuelve null. Si falla, también null → el form muestra "no encontrado".
 */
export const productResolver: ResolveFn<Product | null> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) return of(null);
  return inject(ProductService)
    .fetchOne(id)
    .pipe(catchError(() => of(null)));
};

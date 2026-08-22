import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  imports: [CustomIconComponent, UpperCasePipe],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar {

  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  conFoto = signal(false)
  public router = inject(Router)

  // esto es un signal reactivo
  public user = this.authService.user;

  //para abrir el sidebar
  @Output() openToggleSidebar = new EventEmitter<void>();

  constructor() {
    this.actualizarFoto();
  }

  async actualizarFoto() {
    if (!this.user()?.usuarioId) return;

    // const nuevaFotoUrl = await this.fotoPerfilService.descargarFotoUsuario(this.user().usuarioId);
    // if (nuevaFotoUrl) {
    //   this.conFoto.set(true);
    //   const updatedUser = { ...this.user()!, photoUrl: nuevaFotoUrl };
    //   this.authService.updateUser(updatedUser); // 🔑 sincroniza signal
    //   this.cdr.detectChanges();
    // }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openProfile(event?: Event) {
    event?.preventDefault();
    this.router.navigate(['/dashboard/mi-perfil']);
  }

  optenToggleSidebar() {
     this.openToggleSidebar.emit();
  }


}

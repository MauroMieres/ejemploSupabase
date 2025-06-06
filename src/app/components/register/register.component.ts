import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient, User } from '@supabase/supabase-js'
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
email: string;
password: string;
name: string = '';
age: number = 0;
avatarFile: File | null = null;

constructor(private router: Router) {
  this.email = '';
  this.password = '';
}



register() {
  supabase.auth.signUp({
    email: this.email,
    password: this.password,
  }).then(({ data, error }) => {
    if (error) {
      console.error('Error:', error.message);
      
    } else {

      console.log('User registered:', data.user);
      this.saveUserData(data.user!);
      
    }
  }
  );

}

saveUserData(user: User) {

  const avatarUrl = this.saveFile().then((data) => {
    if (data) { 

  supabase.from('users-data').insert([
    { authId: user.id, name: this.name, age: this.age, avatarUrl: data.path  }
  ]).then(({ data, error }) => {
    if (error) {
      console.error('Error:', error.message);
    } else {
      this.router.navigate(['/home']);
    }
  });
}
});

}

async saveFile() {
const { data, error } = await supabase
  .storage
  .from('images')
  .upload(`users/${this.avatarFile?.name}`, this.avatarFile!, {
    cacheControl: '3600',
    upsert: true
  });

  return data;
}

onFileSelected(event: any) {
  this.avatarFile = event.target.files[0];

  if (this.avatarFile) {
    console.log('Archivo cargado:');
    console.log('Nombre:', this.avatarFile.name);
    console.log('Tipo:', this.avatarFile.type);
  } else {
    console.warn('No se seleccionó ningún archivo.');
  }
}


}

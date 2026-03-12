import { Routes } from '@angular/router';
import { StudentComponent } from './components/student.component/student.component';
import { Dashboard } from './dashboard/dashboard';
import { Login } from './login/login';
import { Layout } from './layout/layout';
import { Studentinfo } from './studentinfo/studentinfo';
import { Studentdetails } from './studentdetails/studentdetails';
import { authGuard } from './service/authservice/auth.guard';
import { ChangePassword } from './auth/change-password/change-password';
export const routes: Routes = [
    {
        path:'',
        redirectTo:'login',
        pathMatch:'full'
    },
    {
        path: 'login',
        component: Login
    },
    {path: 'layout', component: Layout, canActivate: [authGuard], children: [
        {
            path: 'student',
            component: StudentComponent
        },
        {
            path: 'dashboard',
            component: Dashboard
        },
        {
            path: 'studentinfo',
            component: Studentinfo
        },{
            path: 'studentdetails',
            component: Studentdetails
        },{
            path: 'change-password',
            component: ChangePassword
        }
    ]},
];

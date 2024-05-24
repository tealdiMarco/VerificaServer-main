import { Component } from '@angular/core';
import {WebserviceService} from "../service/webservice.service";

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(public webService:WebserviceService) {  }
  loginResp:string="";
  pwd: any = "jimbo";
  mail: any = "happylion915";

  async login() {
    await this.webService.login("login",this.mail,this.pwd);
    this.loginResp=this.webService.loginResponse;
    console.log(this.loginResp);
  }
}

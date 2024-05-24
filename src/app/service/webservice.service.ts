import { Injectable } from '@angular/core';
import {HttpHeaders} from "@angular/common/http";
import {ConnectionService} from "./connection.service";

@Injectable({
  providedIn: 'root'
})
export class WebserviceService {
  headers = new HttpHeaders();
  peopleData:any;
  datiEsami:any;
  esamiOk:boolean = false;
  loginResponse: any;

  constructor(private connectionService: ConnectionService) { }

  async getPeople(endPoint:string): Promise<any>{
    await new Promise((resolve,reject)=>{
      this.headers = new HttpHeaders({'Content-Type':'application/json; charset=utf-8', token:localStorage.getItem("token") || ""});
      this.connectionService.sendGetRequest(endPoint,{headers:this.headers}).subscribe(
        (data:any)=>{
          console.log("In service: data from DB studenti OK");
          resolve(this.peopleData=data.data);
          localStorage.setItem("token",data.token);
          console.log(data.data);
        },
        (error:any)=>{
          console.log("Errore get People");
          console.log(error);
          reject();
        }
      );
    });
  }


  async getExams(endPoint: string, idPerson: any): Promise<any>{
    await new Promise((resolve,reject)=>{
      this.headers = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
      this.connectionService.sendPostRequest(endPoint,{id:idPerson},{headers: this.headers}).subscribe(
        (data:any)=>{
          console.log("In service: esami singolo utente OK");
          if(data.data.length > 0)
            this.esamiOk = true;
          else
            this.esamiOk = false;
          resolve(this.datiEsami=data.data);
        },
        (error:any)=>{
          console.log("Errore get Esami");
          console.log(error);
          reject();
        }
      );
    });
  }

  async login(endPoint:string,u:string,p:string): Promise<any> {
    await new Promise((resolve, reject) => {
      this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
      this.connectionService.sendPostRequest(endPoint, {username: u, password: p}, {headers: this.headers}).subscribe(
        (data: any) => {
          console.log(data.token);
          localStorage.setItem("token",data.token);
          resolve(this.loginResponse=data.msg);
        },
        (error: any) => {
          console.log("Errore di Login...");
          console.log(error);
          reject();
        });
    });
  }
}

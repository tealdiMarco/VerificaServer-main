import {Component, OnInit} from '@angular/core';
import {WebserviceService} from "../service/webservice.service";
import {single} from "rxjs";

@Component({
  selector: 'people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit{
  constructor(public webService:WebserviceService) {   }

  lstPeople:any;
  esami:any;

  async ngOnInit(){
    await this.webService.getPeople("getPeople");
    this.lstPeople=this.webService.peopleData;
    console.log("list people:"+this.lstPeople[0]._id);
    console.log(JSON.stringify(this.lstPeople));

  }

  async getExams(_id: any) {
    await this.webService.getExams("getEsami",_id);
    this.esami=this.webService.datiEsami[0];
    console.log(this.esami);
  }
}

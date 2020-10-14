import {fromEvent as observableFromEvent,  Observable } from 'rxjs';
import {distinctUntilChanged, debounceTime} from 'rxjs/operators';

import { Component, OnInit , ElementRef, ViewChild} from '@angular/core';
import { DelegateDatabase, DelegateDataSource } from './helpers.data';
import {HttpdataService} from '../../services/http-request.service';
import { MatPaginator, MatSort } from '@angular/material';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-fixed-table',
  templateUrl: './delegates.component.html',
  styleUrls: ['./delegates.component.scss']
})

export class delegatesComponent implements OnInit {

	displayedColumns = ['id', 'delegate_name', 'online_status', 'shared_delegate_status', 'delegate_fee', 'total_vote_count', 'block_verifier_online_percentage', 'block_verifier_total_rounds', 'block_producer_total_rounds'];
	exampleDatabase = new DelegateDatabase();
	dataSource: DelegateDataSource | null;
	showFilterTableCode;
  length;
  pagesize;

	constructor(private HttpdataService: HttpdataService) { }

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('filter') filter: ElementRef;

	ngOnInit() {

    this.get_delegates();
  }

	get_delegates() {
    // get the data
	  this.HttpdataService.get_request(this.HttpdataService.SERVER_HOSTNAME_AND_PORT_GET_DELEGATES).subscribe(
  	  (res) => {
        this.exampleDatabase = new DelegateDatabase();
        let data = JSON.parse(JSON.stringify(res));
  	    let count = 0;
        let delegate_total_vote_count;
        let current_delegate_total_vote_count;
        let mode;
        let status;

  	    for (count = 0, delegate_total_vote_count = 0; count < data.length; count++) {
          current_delegate_total_vote_count = parseInt(data[count].total_vote_count) / this.HttpdataService.XCASH_WALLET_DECIMAL_PLACES_AMOUNT;
          status = data[count].online_status == 'true' ? 'Online'  : 'Offline';
          mode = data[count].shared_delegate_status == 'true' ? 'Shared'  : 'Solo';
  	      this.exampleDatabase.addUser((count + 1).toString(),data[count].delegate_name.toString(),status,mode,data[count].delegate_fee.toString(),data[count].block_verifier_total_rounds.toString(),data[count].block_verifier_online_percentage.toString(),current_delegate_total_vote_count.toString(),data[count].block_producer_total_rounds.toString());
  	    }

        // paginator settings
        this.length = data.length;
        this.pagesize = 50;

        this.dataSource = new DelegateDataSource(this.exampleDatabase, this.paginator, this.sort);

        observableFromEvent(this.filter.nativeElement, 'keyup').pipe(
          debounceTime(150),
          distinctUntilChanged(),)
          .subscribe(() => {
            if (!this.dataSource) { return; }
            this.dataSource.filter = this.filter.nativeElement.value;
          }
        );
  	  },
  	  (error) => {
  	    Swal.fire("Error","An error has occured","error");
  	  }
    );
  }

}

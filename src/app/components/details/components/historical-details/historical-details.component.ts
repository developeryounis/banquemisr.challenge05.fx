import { Component, Input } from '@angular/core';
import { HistoricalDataModel } from 'src/app/shared/models/historical.data.model';

@Component({
  selector: 'app-historical-details',
  templateUrl: './historical-details.component.html',
  styleUrls: ['./historical-details.component.scss']
})
export class HistoricalDetailsComponent {

  @Input() historicalData!: HistoricalDataModel;
}

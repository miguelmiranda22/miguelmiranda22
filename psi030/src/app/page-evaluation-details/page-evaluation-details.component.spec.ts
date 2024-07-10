import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEvaluationDetailsComponent } from './page-evaluation-details.component';

describe('PageEvaluationDetailsComponent', () => {
  let component: PageEvaluationDetailsComponent;
  let fixture: ComponentFixture<PageEvaluationDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageEvaluationDetailsComponent]
    });
    fixture = TestBed.createComponent(PageEvaluationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

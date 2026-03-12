import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Studentinfo } from './studentinfo';

describe('Studentinfo', () => {
  let component: Studentinfo;
  let fixture: ComponentFixture<Studentinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Studentinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Studentinfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

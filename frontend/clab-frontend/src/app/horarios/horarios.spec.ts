import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HorariosComponent } from './horarios';

describe('HorariosComponent', () => {
  let component: HorariosComponent;
  let fixture: ComponentFixture<HorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosComponent] // standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(HorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

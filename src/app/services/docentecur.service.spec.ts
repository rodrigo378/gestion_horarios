import { TestBed } from '@angular/core/testing';

import { DocentecurService } from './docentecur.service';

describe('DocentecurService', () => {
  let service: DocentecurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocentecurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

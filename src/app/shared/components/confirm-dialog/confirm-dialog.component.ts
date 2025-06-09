import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true, 
  template: `
    <div class="p-3 bg-primary-light animate__animated animate__fadeIn">
      <h2 mat-dialog-title class="fw-bold text-primary-pale mb-3">Confirm</h2>
      <mat-dialog-content class="mb-4 text-primary-pale fs-6">
        {{ data.message }}
      </mat-dialog-content>
      <div mat-dialog-actions align="end" class="d-flex gap-2 justify-content-end">
        <button mat-stroked-button color="primary"
                class="bg-primary-light text-white fw-semibold px-4 rounded-3 shadow-sm hover-bg-primary-pale"
                (click)="dialogRef.close(false)">
          Cancel
        </button>
        <button mat-raised-button color="warn"
                class="bg-primary-pale text-primary px-4 rounded-3 shadow-sm fw-semibold border-0 animate__animated animate__shakeX"
                (click)="dialogRef.close(true)">
          Delete
        </button>
      </div>
    </div>
  `,
  imports: [MatDialogModule]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}
}

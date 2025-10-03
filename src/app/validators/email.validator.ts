import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable()
export class EmailValidatorService {
    constructor() { }
    emailMatch(email: string, confirm_email: string) {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const emailControl = formGroup.get(email);
            const confirmEmailControl = formGroup.get(confirm_email);

            if (!emailControl || !confirmEmailControl) {
                return null;
            }

            if (
                confirmEmailControl.errors &&
                !confirmEmailControl.errors['emailMismatch']
            ) {
                return null;
            }

            if (emailControl.value !== confirmEmailControl.value) {
                confirmEmailControl.setErrors({ emailMismatch: true });
                return { emailMismatch: true };
            } else {
                confirmEmailControl.setErrors(null);
                return null;
            }
        };
    }
}

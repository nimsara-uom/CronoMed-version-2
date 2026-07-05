package com.smartcare.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PasswordConstraintValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
        // no initialization needed
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            buildConstraint(context, "Password must not be empty");
            return false;
        }
        if (password.length() < 8) {
            buildConstraint(context, "Password must be at least 8 characters long");
            return false;
        }
        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        if (!hasUpper) {
            buildConstraint(context, "Password must contain at least one uppercase letter");
            return false;
        }
        if (!hasLower) {
            buildConstraint(context, "Password must contain at least one lowercase letter");
            return false;
        }
        if (!hasDigit) {
            buildConstraint(context, "Password must contain at least one digit");
            return false;
        }
        if (!hasSpecial) {
            buildConstraint(context, "Password must contain at least one special character");
            return false;
        }
        String lower = password.toLowerCase();
        if (Pattern.compile("(password|123456|qwerty)").matcher(lower).find()) {
            buildConstraint(context, "Password is too common");
            return false;
        }
        return true;
    }

    private void buildConstraint(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}

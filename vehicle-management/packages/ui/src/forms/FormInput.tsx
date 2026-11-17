import type { FormControlProps } from "./FormBase";
import { useFieldContext } from "../hooks";
import { Input } from "../input";
import { FormBase } from "./FormBase";

export function FormInput({ type, ...props }: FormControlProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        type={type}
      />
    </FormBase>
  );
}

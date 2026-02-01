// Temporary utilities until clsx and cva can be installed

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

type ConfigSchema = Record<string, Record<string, string>>
type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?: keyof T[Variant]
}

export function cva<T extends ConfigSchema>(
  base: string,
  config?: {
    variants?: T
    defaultVariants?: ConfigVariants<T>
  }
) {
  return (props?: ConfigVariants<T>) => {
    const classes = [base]

    if (config?.variants && props) {
      for (const [variantName, variantValue] of Object.entries(props)) {
        if (variantValue && config.variants[variantName]) {
          const variantClass = config.variants[variantName][variantValue as string]
          if (variantClass) {
            classes.push(variantClass)
          }
        }
      }
    }

    if (config?.defaultVariants && props) {
      for (const [variantName, defaultValue] of Object.entries(config.defaultVariants)) {
        if (!(variantName in props) && config.variants?.[variantName]) {
          const variantClass = config.variants[variantName][defaultValue as string]
          if (variantClass) {
            classes.push(variantClass)
          }
        }
      }
    }

    return classes.join(' ')
  }
}

export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0]

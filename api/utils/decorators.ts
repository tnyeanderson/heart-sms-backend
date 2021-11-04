/**
 * Marks the property as required by adding its name to Class.required[] 
 * @param target Target object
 * @param name Name of property
 */
export function Required(target: any, name: string) {
  target.constructor.required = [...target.constructor.required, name]
}

/**
 * Marks the property as optional by adding its name to Class.optional[] 
 * @param target Target object
 * @param name Name of property
 */
export function Optional(target: any, name: string) {
  target.constructor.optional = [...target.constructor.optional, name]
}

/**
 * Marks the property as the holder of an array of items by setting Class.itemsPropName
 * @param target Target object
 * @param name Name of property
 */
export function ItemsProp(target: any, name: string) {
    target.constructor.itemsPropName = name
}

/**
 * Marks the class as requiring that at least one of the optional properties must be set
 * @param constructor The class to mark
 */
export function AtLeastOne(constructor: any) {
    constructor.atLeastOne = true
}
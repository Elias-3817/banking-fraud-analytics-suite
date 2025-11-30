declare module "csv-parse/sync" {
  export function parse(
    input: string,
    options?: {
      columns?: boolean | string[];
      skip_empty_lines?: boolean;
      [key: string]: any;
    }
  ): any[];
}

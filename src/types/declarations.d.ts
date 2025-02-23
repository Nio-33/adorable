declare module 'firebase/app' {
  export * from '@firebase/app';
}

declare module 'firebase/auth' {
  export * from '@firebase/auth';
}

declare module 'firebase/database' {
  export * from '@firebase/database';
}

declare module 'firebase/storage' {
  export * from '@firebase/storage';
}

// Ensure all .ts files are treated as modules
declare module '*.ts' {
  const content: any;
  export default content;
}

// Add support for importing images
declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
} 
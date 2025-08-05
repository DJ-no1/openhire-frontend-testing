declare namespace JSX {
  interface IntrinsicElements {
    'audio-recorder': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      style?: string;
      visualizer?: string;
      controls?: string;
      timer?: string;
      audio?: string;
      video?: string;
    };
  }
}
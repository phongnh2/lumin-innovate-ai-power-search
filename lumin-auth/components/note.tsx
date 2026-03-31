import classNames from 'classnames';

export type NoteProps = {
  className?: string;
  danger?: boolean;
  children?: React.ReactNode;
};

export function Note(props: NoteProps) {
  return (
    <p
      className={classNames(
        props.className,
        'px-4 py-2 text-sm rounded-lg relative',
        'before:bg-secondary-50 before:w-0.5 before:h-3/5 before:block before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
        {
          'bg-secondary-10': props.danger
        }
      )}
    >
      {props.children}
    </p>
  );
}

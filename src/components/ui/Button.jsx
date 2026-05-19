export function PrimaryButton({ children, icon: Icon, onClick }) {
    return (
      <button type="button" className="btn btn-primary" onClick={onClick}>
        {Icon && <Icon size={18} />}
        {children}
      </button>
    );
  }
  
  export function SecondaryButton({ children, icon: Icon, onClick }) {
    return (
      <button type="button" className="btn btn-secondary" onClick={onClick}>
        {Icon && <Icon size={18} />}
        {children}
      </button>
    );
  }
import styles from './CalculatorButton.module.scss';

type CalculatorButtonProps = {
  label: string;
  onClick: (label: string) => void;
  id?: string;
};

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ label, id, onClick }) => {
  const buttonClass = id === 'equals' ? `${styles.calculatorButton} ${styles.equalsButton}` 
                                      : styles.calculatorButton;

  const handleClick = (label: string) => {
    onClick(label);
    (document.activeElement as HTMLElement)?.blur(); //снимаем фокус с активного элемента
  };                                    

  return (
    <button 
      className={buttonClass} 
      onClick={() => handleClick(label)}
      id={id} 
      style={styles}
    >
      {label}
    </button>
  );
};

export default CalculatorButton;

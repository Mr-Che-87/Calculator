import styles from './CalculatorDisplay.module.scss';

type CalculatorDisplayProps = {
  expression: string;
  expressionWithEqual: string; 
  result: string;
};

const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({ expression, expressionWithEqual, result }) => {
  const displayExpression = expressionWithEqual || expression.replace(/\*/g, "×");
 
  return (
    <div className={styles.displayContainer}>
      <div className={styles.displayCurrent}>
        {displayExpression || "0"}
      </div>
      <div className={styles.displayResult}>
        {result || "0"}
        </div>
    </div>
  );
};

export default CalculatorDisplay;

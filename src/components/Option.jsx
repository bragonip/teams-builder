import PropTypes from 'prop-types';

const Option = ({optionName,action }) => {

    return (
        <div>
            <button onClick={action}>
                {optionName}
            </button>
        </div>
    )
}

// Definición de los tipos de props que espera el componente
Option.propTypes = {
    optionName: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
};

export default Option;

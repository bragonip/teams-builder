import PropTypes from 'prop-types';

const Option = ({ optionName }) => {
    return (
        <div>
            <p>{optionName}</p>
        </div>
    );
}

// Definición de los tipos de props que espera el componente
Option.propTypes = {
    optionName: PropTypes.string.isRequired, // optionName debe ser una string y es requerido
};

export default Option;

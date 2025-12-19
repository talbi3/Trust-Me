import styles from './FeaturePage.module.css';
import SettingsRow from '../../components/SettingsRow/SettingsRow.jsx'; 
import ToggleSwitch from '../../components/common/ToggleSwitch/ToggleSwitch.jsx'; 
import SelectInput from '../../components/common/SelectInput/SelectInput.jsx'; 

const feature = {
  name: "General Feature",
  description: "This is a general feature used to demonstrate the FeaturePage component."
};


const FeatureElement = () => {
  return (
    <div className={styles.entity}>
      <h2 className={styles.entityName}>{feature.name}</h2>
      {
        feature.description && <p className={styles.entityDescription}>{feature.description}</p>
      }
      <SettingsRow
        title="Feature ID"
        description="The unique identifier for this feature"
        action={<ToggleSwitch />}
      />
      <SettingsRow
        title="Feature Type"
        description="The type of this feature"
        action={<SelectInput options={[]} />}
      />
    </div>
  );
};

const Feature = () => {
  return (
    
    <div className={styles.home}>
      <h1 className={styles.headline}>Feature</h1>
     <div className={styles.container}>
      <FeatureElement />
 
    </div>
    </div>
  );
};

export default Feature;

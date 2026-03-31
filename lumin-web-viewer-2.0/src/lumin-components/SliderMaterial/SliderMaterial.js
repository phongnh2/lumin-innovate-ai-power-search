import Slider from '@mui/material/Slider';
import React from 'react';
import './SliderMaterial.scss';

class SliderMaterial extends React.PureComponent {
  render() {
    return (
      <Slider
        classes={{
          thumb: 'SliderMaterial__thumb',
          root: 'SliderMaterial',
          track: 'SliderMaterial__track',
          rail: 'SliderMaterial__rail',
          active: 'SliderMaterial__active',
        }}
        {...this.props}
      />
    );
  }
}

export default SliderMaterial;

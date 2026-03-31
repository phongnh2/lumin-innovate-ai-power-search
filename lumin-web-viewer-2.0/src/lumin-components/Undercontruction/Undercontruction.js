import React from 'react';
import UnderContructionImg from 'assets/images/under-construciton.svg';
import './Undercontruction.scss';

const Undercontruction = () => (
  <div className="Undercontruction__wrapper">
    <img className="Undercontruction_img" src={UnderContructionImg} alt="Undercontruction" />
    <h2 className="Undercontruction__text">This page is under construction</h2>
  </div>);

export default Undercontruction;

import styled from "styled-components";
import { typographies } from "constants/styles/editor";
import leftArrow from 'assets/lumin-svgs/ic_left_arrow.svg';
import rightArrow from 'assets/lumin-svgs/ic_right_arrow.svg';

export const DatePickerWrapper = styled.div`
  .pika-single {
    border: none;
    ${{ ...typographies.le_label_medium }};

    background-color: transparent;
  }

  .pika-lendar {
    margin: 0;
    width: fit-content;
    padding: 6px 0 8px 0;
  }

  .pika-title {
    padding: 0 8px;
  }

  .pika-label {
    ${{ ...typographies.le_label_medium }};
    color: ${({ theme }) => theme.le_main_on_surface};
    background-color: transparent;
  }

  .pika-table {
    border-spacing: 8px 0;
    border-collapse: separate;
    padding: 0px 2px;
    th {
      color: ${({ theme }) => theme.le_main_on_surface_variant};
      ${{ ...typographies.le_label_medium }};
      padding: 2px 0;
      height: 16px;
    }
    abbr {
      text-decoration: none;
      cursor: pointer;
    }

  }
  .pika-row {
    .pika-button {
      padding: 4px 0px;
      height: 24px;
      width: 28px;
      color: ${({ theme }) => theme.le_main_on_surface_variant};
      ${{ ...typographies.le_label_medium }};
      &:hover {

        background-color: ${({ theme }) => theme.le_state_layer_on_surface_hovered};
      }
    }
  }

.pika-prev, .pika-next {
  background-image: none;
  opacity: 0.7;
  background-color: ${({ theme }) => theme.le_main_on_surface};


  &:hover {
    opacity: 1;
  }

  &.is-disabled {
    cursor: default;
    opacity: 0.2;
  }
}

  .pika-prev,
  .is-rtl .pika-next {

    float: left;
    mask-image: url('${leftArrow}');
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-mask-image: url('${leftArrow}');
  }

  .pika-next,
  .is-rtl .pika-prev {
    float: right;
    mask-image: url('${rightArrow}');
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-mask-image: url('${rightArrow}');
  }

  .is-selected {
  .pika-button {
    color: ${({ theme }) => theme.le_main_on_primary_container};
    background-color: ${({ theme }) => theme.le_main_primary_container};
    box-shadow: none;

    &:hover {
      color: ${({ theme }) => theme.le_main_on_primary_container};
      background-color: ${({ theme }) => theme.le_main_primary_container};
    }
  }
}

  .is-today {
    .pika-button {
      background: transparent;
    }
  }
`;



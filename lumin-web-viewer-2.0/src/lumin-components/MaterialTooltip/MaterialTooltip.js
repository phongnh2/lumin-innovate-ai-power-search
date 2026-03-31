/* eslint-disable react/prop-types */
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';

function arrowGenerator(color) {
	return {
		zIndex: 89,
		'&[x-placement*="bottom"] $arrow': {
			top: 0,
			left: 0,
			marginTop: '-0.95em',
			width: '3em',
			height: '1em',
			'&::before': {
				borderWidth: '0 1em 1em 1em',
				borderColor: `transparent transparent ${color} transparent`,
			},
		},
		'&[x-placement*="top"] $arrow': {
			bottom: 0,
			left: 0,
			marginBottom: '-0.95em',
			width: '3em',
			height: '1em',
			'&::before': {
				borderWidth: '1em 1em 0 1em',
				borderColor: `${color} transparent transparent transparent`,
			},
		},
		'&[x-placement*="right"] $arrow': {
			left: 0,
			marginLeft: '-0.95em',
			height: '3em',
			width: '1em',
			'&::before': {
				borderWidth: '1em 1em 1em 0',
				borderColor: `transparent ${color} transparent transparent`,
			},
		},
		'&[x-placement*="left"] $arrow': {
			right: 0,
			marginRight: '-0.95em',
			height: '3em',
			width: '1em',
			'&::before': {
				borderWidth: '1em 0 1em 1em',
				borderColor: `transparent transparent transparent ${color}`,
			},
		},
	};
}

const useStyles = makeStyles(() => ({
	luminTooltip: {
		backgroundColor: '#273d57',
		color: '#ffffff',
		boxShadow: 'none',
		fontSize: 12,
		borderRadius: '2px'
	},
	arrowPopper: {
		...arrowGenerator('#273d57'),
		zIndex: 1500
	},
	arrow: {
		position: 'absolute',
		fontSize: 7,
		width: '3em',
		height: '1em',
		'&::before': {
			content: '""',
			margin: 'auto',
			display: 'block',
			width: 0,
			height: 0,
			borderStyle: 'solid',
		},
	},
}));

function MaterialTooltip(props) {
	const classes = useStyles();
	const [arrowRef, setArrowRef] = useState(null);

	const { title, children, placement } = props;
	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (!title) return <>{children}</>;
	return (
		<Tooltip
			title={
				<div className='material-tooltip'>
					{title}
					<span className={classes.arrow} ref={setArrowRef} />
				</div>
			}
			placement={placement || 'bottom'}
			classes={{ popper: classes.arrowPopper, tooltip: classes.luminTooltip }}
			PopperProps={{
				popperOptions: {
					modifiers: {
						arrow: {
							enabled: Boolean(arrowRef),
							element: arrowRef,
						},
					},
				},
			}}>
			{children}
		</Tooltip>
	);
}

export default MaterialTooltip;
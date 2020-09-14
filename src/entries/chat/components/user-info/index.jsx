import React, {
	Component
} from 'react';

import {
	SketchComponent,
	ProfilePictureComponent,
	LabelComponent,
	TagComponent,
	DropDownMenuComponent,
	LoadingComponent
} from 'shared/components';

import classNames from 'classnames';

export default class UserInfoComponent extends Component {
	constructor (props) {
		super(props);
		this.state = {
			actionDropdownIsOpen: false
		};
	}

	onChangeDropDownActions = (status) => {
		this.setState({
			actionDropdownIsOpen: status
		});
	}

	render () {
		const {
			actionDropdownIsOpen
		} = this.state;

		const {
			isFetching,
			isFetchingAction,
			profile,
			title,
			desc,
			column,
			rightLabel,
			wrapperStyle,
			sketchDark,
			tagInfo,
			actions
		} = this.props;

		const userInfoContainerStyles = classNames({
			'user-info-container': true,
			column
		});

		const actionsContainerStyles = classNames({
			'actions-container': true,
			visible: actionDropdownIsOpen
		});

		if (isFetching) {
			return (
				<div
					className='user-info-wrapper'
					style={wrapperStyle}
				>
					<div className={userInfoContainerStyles}>
						<SketchComponent
							width={profile.width}
							height={profile.height}
							circle
							dark={sketchDark}
						/>
						<div
							className='labels-container'
						>
							{
								title ? (
									<SketchComponent
										width={90}
										height={8}
										margin={title.margin}
										dark={sketchDark}
									/>
								) : null
							}

							{
								desc ? (
									<SketchComponent
										width={60}
										height={8}
										margin={desc.margin}
										dark={sketchDark}
									/>
								) : null
							}
						</div>
					</div>
				</div>
			);
		}

		return (
			<div
				className='user-info-wrapper'
				style={wrapperStyle}
			>
				<div className={userInfoContainerStyles}>
					<ProfilePictureComponent
						{
						...profile
						}
					/>
					<div className='labels-container'>
						<LabelComponent
							fontSemiBold
							dark
							breakWord
							{
							...title
							}
						/>
						<LabelComponent
							fontRegular
							dark
							breakWord
							{
							...desc
							}
						/>
					</div>
				</div>

				{
					isFetchingAction ? (
						<div
							className='info-container'
						>
							<div
								className='loading-container'
							>
								<LoadingComponent
									type='donut'
								/>
							</div>
						</div>
					)
						: (
							<div
								className='info-container'
							>
								{
									rightLabel ? (
										<LabelComponent
											fontRegular
											text={rightLabel}
											fontSize={13}
											alignRight
											width={100}
											margin="0px 0px 5px 0px"
										/>
									) : null
								}
								<div
									className='footer-container'
								>
									{
										tagInfo ? (
											<TagComponent
												success
												text={tagInfo}
											/>
										) : null
									}
									{
										actions ? (
											<div
												className={actionsContainerStyles}
											>
												<DropDownMenuComponent
													options={actions.options}
													icon={{
														fill: '#555657',
														icon: 'arrow-down',
														width: '100%',
														height: '100%'
													}}
													onChange={this.onChangeDropDownActions}
													marginButton='0px 0px 0px 8px'
												/>
											</div>
										) : null
									}
								</div>
							</div>
						)
				}
			</div>
		);
	}
}

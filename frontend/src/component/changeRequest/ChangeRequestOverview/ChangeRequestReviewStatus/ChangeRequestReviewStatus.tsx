import React, { FC } from 'react';
import { Box, IconButton, Theme, Typography, useTheme } from '@mui/material';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import {
    StyledOuterContainer,
    StyledButtonContainer,
    StyledReviewStatusContainer,
    StyledFlexAlignCenterBox,
    StyledSuccessIcon,
    StyledErrorIcon,
    StyledWarningIcon,
    StyledReviewTitle,
    StyledDivider,
    StyledScheduledIcon,
    StyledEditIcon,
    StyledScheduledBox,
} from './ChangeRequestReviewStatus.styles';
import {
    ChangeRequestState,
    IChangeRequest,
} from 'component/changeRequest/changeRequest.types';

interface ISuggestChangeReviewsStatusProps {
    changeRequest: IChangeRequest;
}
const resolveBorder = (state: ChangeRequestState, theme: Theme) => {
    if (state === 'Approved' || state === 'Scheduled') {
        return `2px solid ${theme.palette.success.main}`;
    }

    if (state === 'Applied') {
        return `2px solid ${theme.palette.primary.main}`;
    }

    return `1px solid ${theme.palette.divider}`;
};

const resolveIconColors = (state: ChangeRequestState, theme: Theme) => {
    if (state === 'Approved') {
        return {
            bgColor: theme.palette.success.main!,
            svgColor: theme.palette.background.paper,
        };
    }

    if (state === 'Applied') {
        return {
            bgColor: theme.palette.primary.main!,
            svgColor: theme.palette.background.paper,
        };
    }

    return {
        bgColor: theme.palette.background.elevation2,
        svgColor: theme.palette.neutral.main!,
    };
};

export const ChangeRequestReviewStatus: FC<ISuggestChangeReviewsStatusProps> =
    ({ changeRequest }) => {
        const theme = useTheme();
        return (
            <StyledOuterContainer>
                <StyledButtonContainer
                    {...resolveIconColors(changeRequest.state, theme)}
                >
                    <ChangesAppliedIcon
                        style={{
                            transform: `scale(1.5)`,
                        }}
                    />
                </StyledButtonContainer>
                <StyledReviewStatusContainer
                    sx={{
                        backgroundColor:
                            changeRequest.state === 'In review'
                                ? theme.palette.warning.light
                                : 'initial',
                    }}
                    border={resolveBorder(changeRequest.state, theme)}
                >
                    <ResolveComponent changeRequest={changeRequest} />
                </StyledReviewStatusContainer>
            </StyledOuterContainer>
        );
    };

interface IResolveComponentProps {
    changeRequest: IChangeRequest;
}

const ResolveComponent = ({ changeRequest }: IResolveComponentProps) => {
    const { state } = changeRequest;

    if (!state) {
        return null;
    }

    if (state === 'Approved') {
        return <Approved />;
    }

    if (state === 'Applied') {
        return <Applied />;
    }

    if (state === 'Cancelled') {
        return <Cancelled />;
    }

    if (state === 'Rejected') {
        return <Rejected />;
    }

    if (state === 'Scheduled') {
        return (
            <Scheduled scheduledDate={changeRequest.schedule?.scheduledAt} />
        );
    }

    return <ReviewRequired minApprovals={changeRequest.minApprovals} />;
};

const Approved = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.success.dark}>
                        Changes approved
                    </StyledReviewTitle>
                    <Typography>
                        One approving review from requested approvers
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.success.dark}>
                        Changes are ready to be applied
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

interface IReviewRequiredProps {
    minApprovals: number;
}

const ReviewRequired = ({ minApprovals }: IReviewRequiredProps) => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledWarningIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.warning.dark}>
                        Review required
                    </StyledReviewTitle>
                    <Typography>
                        At least {minApprovals} approval(s) must be submitted
                        before changes can be applied
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledFlexAlignCenterBox>
                <StyledWarningIcon />
                <StyledReviewTitle color={theme.palette.warning.dark}>
                    Apply changes is blocked
                </StyledReviewTitle>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const Applied = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon sx={{ color: theme.palette.primary.main }} />
                <Box>
                    <StyledReviewTitle color={theme.palette.primary.main}>
                        Changes applied
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

interface IScheduledProps {
    scheduledDate?: string;
}
const Scheduled = ({ scheduledDate }: IScheduledProps) => {
    const theme = useTheme();

    if (!scheduledDate) {
        return null;
    }

    const getBrowserTimezone = (): string => {
        const offset = -new Date().getTimezoneOffset();
        const hours = Math.floor(Math.abs(offset) / 60);
        const minutes = Math.abs(offset) % 60;
        let sign = '+';
        if (offset < 0) {
            sign = '-';
        }

        // Ensure that hours and minutes are two digits
        const zeroPaddedHours = hours.toString().padStart(2, '0');
        const zeroPaddedMinutes = minutes.toString().padStart(2, '0');

        return `UTC${sign}${zeroPaddedHours}:${zeroPaddedMinutes}`;
    };

    const timezone = getBrowserTimezone();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.success.dark}>
                        Changes approved
                    </StyledReviewTitle>
                    <Typography>
                        One approving review from requested approvers
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledScheduledBox>
                <StyledFlexAlignCenterBox>
                    <StyledScheduledIcon />
                    <Box>
                        <StyledReviewTitle color={theme.palette.warning.dark}>
                            Changes are scheduled to be applied on:{' '}
                            {new Date(scheduledDate).toLocaleString()}
                        </StyledReviewTitle>
                        <Typography>Your timezone is {timezone}</Typography>
                    </Box>
                </StyledFlexAlignCenterBox>
                <IconButton>
                    <StyledEditIcon />
                </IconButton>
            </StyledScheduledBox>
        </>
    );
};

const Cancelled = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.error.main}>
                        Changes cancelled
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const Rejected = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.error.main}>
                        Changes rejected
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

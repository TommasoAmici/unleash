import {
    IMessageBanner,
    MessageBanner,
} from 'component/messageBanners/MessageBanner/MessageBanner';
import { useLicenseCheck } from 'hooks/api/getters/useLicense/useLicense';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useVariant } from 'hooks/useVariant';

export const ExternalMessageBanners = () => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const licenseInfo = useLicenseCheck();
    

    const messageBannerVariant =
        useVariant<IMessageBanner | IMessageBanner[]>(
            uiConfig.flags.messageBanner,
        ) || [];

    const messageBanners: IMessageBanner[] = Array.isArray(messageBannerVariant)
        ? messageBannerVariant
        : [messageBannerVariant];

    // Only for enterprise
    if(isEnterprise()) {
        if(licenseInfo && !licenseInfo.isValid && !licenseInfo.loading && !licenseInfo.error) {
            messageBanners.push({
                message: licenseInfo.message || 'You have an invalid Unleash license.',
                variant: 'error',
                sticky: true,
            });
        }
    }
    

    return (
        <>
            {messageBanners.map((messageBanner) => (
                <MessageBanner
                    key={messageBanner.message}
                    messageBanner={messageBanner}
                />
            ))}
        </>
    );
};

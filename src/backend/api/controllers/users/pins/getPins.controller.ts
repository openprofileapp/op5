import type { Request, Response } from 'express';

import { AdvancedError } from 'kage-library';

import { log } from '../../../instances.js';
import getPinsByOwnerId from '../../../services/getPinsByOwnerId.service.js';
import PlatformPermissionsService from '../../../../_common/services/platformPermissions.service.js';

export const getPins = (req: Request, res: Response) => {
    try {
        const { ownerId } = req.params;

        /*// TEMP (DELETE)
        if (req.session) {
            return res.status(200).json({
                owned: PlatformPermissionsService.can(
                    req.session, 
                    ["VIEW"], // "VIEW_BIRTHDATE" etc. (if no, trim that part when fetching profiles)
                    "6773794953695671"
                ),
                unownedButAllowed: PlatformPermissionsService.can(
                    req.session, 
                    ["VIEW", "READ"], 
                    "1655391085225720"
                ),
                unowned: PlatformPermissionsService.can(
                    req.session, 
                    ["VIEW"], 
                    "6587823496323314"
                )
            });
        }*/

        return res.status(200).json({
            ...getPinsByOwnerId(ownerId as string)
        });
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
        }
    }
};
package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import no.deichman.services.entity.Estimation;

/**
 * Responsibility: Manage holds from library system.
 */
public class Reservation extends CirculationObjectBase {
    @Expose
    @SerializedName(value = "suspended", alternate = "suspend")
    private boolean suspended;
    @Expose
    @SerializedName(value = "queuePlace", alternate = "priority")
    private String queuePlace;
    @SerializedName(value = "itemType", alternate = "itemtype")
    private String itemType;
    @Expose
    @SerializedName(value = "orderedDate", alternate = "reservedate")
    private String orderedDate;
    @SerializedName("timestamp")
    private String timestamp;
    @SerializedName("lowestPriority")
    private String lowestPriority;
    @Expose
    @SerializedName(value = "suspendUntil", alternate = "suspend_until")
    private String suspendUntil;
    @SerializedName(value = "status", alternate = "found")
    private String status;
    @Expose
    @SerializedName("estimatedWait")
    private Estimation estimation;
    @Expose
    @SerializedName("pickupNumber")
    private String pickupNumber;

    public final String getStatus() {
        return this.status;
    }

    public final void setQueuePlace(String queuePlace) {
        this.queuePlace = queuePlace;
    }

    public final void setSuspended(boolean suspended) {
        this.suspended = suspended;
    }

    public final void setOrderedDate(String orderedDate) {
        this.orderedDate = orderedDate;
    }

    public final void setSuspendUntil(String suspendUntil) {
        this.suspendUntil = suspendUntil;
    }

    public final void setEstimatedWait(Estimation estimation) {
        this.estimation = estimation;
    }

    public final int getQueuePlace() {
        return Integer.valueOf(queuePlace);
    }


    public final String getPickupNumber() {
        return pickupNumber;
    }

    public final void setPickupNumber(String pickupNumber) {
        this.pickupNumber = pickupNumber;
    }
}

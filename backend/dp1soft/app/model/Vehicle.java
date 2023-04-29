/*
    Vehicle.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.model;

//Es el modelo para un vehículo, ya sea Carro o Moto
public class Vehicle {

    //region Atributos
    //Id del vehículo
    private int id;
    //Tipo del vehículo, Carro o Moto
    private String type;
    //Velocidad del vehículo en km/h
    private double speed;
    //Costo por km del vehículo
    private double cost;
    //Turno en el que salió el vehículo
    private int turn;
    //Costo por hora extra del vehículo
    private double overtime;
    /*
        0 - Libre
        1 - Ocupado
        2 - Regresando
        3 - Falla (por un turno)
        4 - Falla (por 2 días, primera fase)
        5 - Falla (por 2 días, segunda fase)
    */
    private int state;
    //Capacidad máxima del vehículo
    private int capacity;
    //Cuanto está llevando actualmente
    private int carry;
    //Se movió el minuto anterior
    private boolean moved;
    //Paquete que está cumpliendo el vehículo
    private Pack pack;
    //Ruta que está siguiendo el vehículo
    private Solution route;
    //Ubicación actual del vehículo
    private Node location;
    //endregion

    //region Getters/Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getSpeed() {
        return speed;
    }

    public void setSpeed(double speed) {
        this.speed = speed;
    }

    public double getCost() {
        return cost;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    public int getTurn() {
        return turn;
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }

    public double getOvertime() {
        return overtime;
    }

    public void setOvertime(double overtime) {
        this.overtime = overtime;
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getCarry() {
        return carry;
    }

    public void setCarry(int carry) {
        this.carry = carry;
    }

    public boolean isMoved() {
        return moved;
    }

    public void setMoved(boolean moved) {
        this.moved = moved;
    }

    public Pack getPack() {
        return pack;
    }

    public void setPack(Pack pack) {
        this.pack = pack;
    }

    public Solution getRoute() {
        return route;
    }

    public void setRoute(Solution route) {
        this.route = route;
    }

    public Node getLocation() {
        return location;
    }

    public void setLocation(Node location) {
        this.location = location;
    }
    //endregion

}
